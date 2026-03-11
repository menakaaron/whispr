const { DynamoDBClient, UpdateItemCommand } = require("@aws-sdk/client-dynamodb");
const { BedrockRuntimeClient, InvokeModelCommand } = require("@aws-sdk/client-bedrock-runtime");

const dynamo = new DynamoDBClient({ region: "us-east-1" });
const bedrock = new BedrockRuntimeClient({ region: "us-east-1" });

const CORS_HEADERS = {
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type,Authorization",
  "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
};

exports.handler = async (event) => {
  try {
    const body = JSON.parse(event.body);
    const { conversationId, transcript, nativeLanguage, targetLanguage } = body;

    if (!conversationId || !transcript) {
      return {
        statusCode: 400,
        headers: CORS_HEADERS,
        body: JSON.stringify({ error: "conversationId and transcript are required" }),
      };
    }

    const prompt = `You are a cultural language coach helping someone who speaks ${nativeLanguage} learn to communicate naturally in ${targetLanguage}.

Analyze this conversation transcript and provide:
1. Pronunciation score (0-100): Based on likely pronunciation patterns from the text
2. Fluency score (0-100): Based on sentence structure, word choice, and natural flow
3. Tone score (0-100): Based on formality, politeness, and appropriateness
4. Cultural cues: Phrases with cultural meaning beyond literal translation
5. Social norms: Unspoken rules demonstrated in the conversation
6. Fluency notes: Specific observations about language use
7. Actionable suggestions for improvement

Transcript:
"${transcript}"

Respond in this exact JSON format with no extra text:
{
  "pronunciationScore": 75,
  "fluencyScore": 80,
  "toneScore": 85,
  "culturalCues": [
    {"phrase": "the phrase", "literalMeaning": "what it says", "actualMeaning": "what it really means", "context": "when to use it"}
  ],
  "socialNorms": ["norm 1", "norm 2"],
  "fluencyNotes": ["note 1", "note 2"],
  "suggestions": ["suggestion 1", "suggestion 2"]
}`;

    const response = await bedrock.send(new InvokeModelCommand({
      modelId: "us.anthropic.claude-sonnet-4-6",
      contentType: "application/json",
      accept: "application/json",
      body: JSON.stringify({
        anthropic_version: "bedrock-2023-05-31",
        max_tokens: 2000,
        messages: [{ role: "user", content: prompt }],
      }),
    }));

    const responseBody = JSON.parse(Buffer.from(response.body).toString());
    const rawText = responseBody.content[0].text;
    console.log("RAW BEDROCK RESPONSE:", rawText);
    const cleaned = rawText.replace(/```json|```/g, "").trim();
    console.log("CLEANED:", cleaned);
    const analysis = JSON.parse(cleaned);

    // Save feedback to DynamoDB only after successful analysis
    await dynamo.send(new UpdateItemCommand({
      TableName: "whispr-conversations",
      Key: {
        PK: { S: `USER#${body.userId}` },
        SK: { S: `CONVO#${body.createdAt}` },
      },
      UpdateExpression: "SET feedbackStatus = :status",
      ExpressionAttributeValues: {
        ":status": { S: "complete" },
      },
    }));

    return {
      statusCode: 200,
      headers: CORS_HEADERS,
      body: JSON.stringify({ conversationId, analysis }),
    };
  } catch (error) {
    console.error("ERROR in analyzeCulture:", error);
    return {
      statusCode: 500,
      headers: CORS_HEADERS,
      body: JSON.stringify({ error: error.message || "Analysis failed" }),
    };
  }
};