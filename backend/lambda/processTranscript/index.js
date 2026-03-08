const { S3Client, GetObjectCommand } = require("@aws-sdk/client-s3");
const { DynamoDBClient, PutItemCommand, QueryCommand } = require("@aws-sdk/client-dynamodb");
const { BedrockRuntimeClient, InvokeModelCommand } = require("@aws-sdk/client-bedrock-runtime");

const s3 = new S3Client({ region: "us-east-1" });
const dynamo = new DynamoDBClient({ region: "us-east-1" });
const bedrock = new BedrockRuntimeClient({ region: "us-east-1" });

exports.handler = async (event) => {
  try {
    // Get the S3 file that triggered this Lambda
    const s3Event = event.Records[0].s3;
    const bucket = s3Event.bucket.name;
    const key = decodeURIComponent(s3Event.object.key.replace(/\+/g, " "));

    // Only process transcript files
    if (!key.startsWith("transcripts/")) return;

    // Extract conversationId from filename
    const conversationId = key.replace("transcripts/", "").replace(".json", "");

    // Read the transcript from S3
    const s3Response = await s3.send(new GetObjectCommand({ Bucket: bucket, Key: key }));
    const transcriptData = JSON.parse(await s3Response.Body.transformToString());
    const transcript = transcriptData.results.transcripts[0].transcript;

    // Find the conversation in DynamoDB
    const convoResult = await dynamo.send(new QueryCommand({
      TableName: "whispr-conversations",
      IndexName: "conversationId-index",
      KeyConditionExpression: "conversationId = :cid",
      ExpressionAttributeValues: {
        ":cid": { S: conversationId },
      },
    }));

    if (!convoResult.Items || convoResult.Items.length === 0) {
      console.error("Conversation not found:", conversationId);
      return;
    }

    const conversation = convoResult.Items[0];
    const userId = conversation.PK.S.replace("USER#", "");

    // Get user profile for language info
    const userResult = await dynamo.send(new QueryCommand({
      TableName: "whispr-users",
      KeyConditionExpression: "PK = :pk AND SK = :sk",
      ExpressionAttributeValues: {
        ":pk": { S: `USER#${userId}` },
        ":sk": { S: "PROFILE" },
      },
    }));

    const user = userResult.Items[0];
    const nativeLanguage = user.nativeLanguage.S;
    const targetLanguage = user.targetLanguage.S;

    // Run cultural analysis via Bedrock
    const prompt = `You are a cultural language coach helping someone who speaks ${nativeLanguage} learn to communicate naturally in ${targetLanguage}.

Analyze this conversation transcript and identify:
1. Any phrases that have cultural or social meaning beyond their literal words
2. Any social norms or unspoken rules demonstrated
3. Any pronunciation or fluency patterns to note
4. Specific actionable suggestions for improvement

Transcript:
"${transcript}"

Respond in this exact JSON format with no extra text:
{
  "culturalCues": [
    {"phrase": "the phrase", "literalMeaning": "what it says", "actualMeaning": "what it really means", "context": "when to use it"}
  ],
  "socialNorms": ["norm 1", "norm 2"],
  "fluencyNotes": ["note 1", "note 2"],
  "suggestions": ["suggestion 1", "suggestion 2"]
}`;

    const bedrockResponse = await bedrock.send(new InvokeModelCommand({
      modelId: "us.anthropic.claude-sonnet-4-6",
      contentType: "application/json",
      accept: "application/json",
      body: JSON.stringify({
        anthropic_version: "bedrock-2023-05-31",
        max_tokens: 2000,
        messages: [{ role: "user", content: prompt }],
      }),
    }));

    const bedrockBody = JSON.parse(Buffer.from(bedrockResponse.body).toString());
    const rawText = bedrockBody.content[0].text;
    const cleaned = rawText.replace(/```json|```/g, "").trim();

    let analysis;
    try {
      analysis = JSON.parse(cleaned);
    } catch (parseError) {
      console.error("Failed to parse Bedrock response:", rawText);
      // Save raw text as feedback so it's not lost
      analysis = {
        culturalCues: [],
        socialNorms: [rawText],
        fluencyNotes: [],
        suggestions: []
      };
    }

    // Save feedback to DynamoDB
    await dynamo.send(new PutItemCommand({
      TableName: "whispr-feedback",
      Item: {
        PK: { S: `CONVO#${conversationId}` },
        SK: { S: "FEEDBACK#cultural" },
        feedbackType: { S: "cultural" },
        transcript: { S: transcript },
        insights: { L: analysis.culturalCues.map(c => ({ S: JSON.stringify(c) })) },
        socialNorms: { L: analysis.socialNorms.map(n => ({ S: n })) },
        fluencyNotes: { L: analysis.fluencyNotes.map(n => ({ S: n })) },
        suggestions: { L: analysis.suggestions.map(s => ({ S: s })) },
        generatedBy: { S: "us.anthropic.claude-sonnet-4-6" },
        createdAt: { S: new Date().toISOString() },
      },
    }));

    console.log("Successfully processed transcript for conversation:", conversationId);

  } catch (error) {
    console.error("Error processing transcript:", error);
    throw error;
  }
};