const { BedrockRuntimeClient, InvokeModelCommand } = require("@aws-sdk/client-bedrock-runtime");

const bedrock = new BedrockRuntimeClient({ region: "us-east-1" });

exports.handler = async (event) => {
  try {
    const body = JSON.parse(event.body);
    const { scenario, userMessage, conversationHistory, nativeLanguage, targetLanguage } = body;

    if (!scenario || !userMessage) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "scenario and userMessage are required" }),
      };
    }

    const systemPrompt = `You are a realistic conversation partner helping a ${nativeLanguage} speaker practice ${targetLanguage} for the following scenario: ${scenario}.

Your role:
- Respond naturally as the other person in this scenario
- Keep responses concise and realistic
- After your response, provide a brief coaching note in this format:
  [COACH: one specific tip about what they did well or could improve]

Stay in character and make the practice feel real.`;

    const messages = [
      ...(conversationHistory || []),
      { role: "user", content: userMessage }
    ];

    const response = await bedrock.send(new InvokeModelCommand({
      modelId: "us.anthropic.claude-sonnet-4-6",
      contentType: "application/json",
      accept: "application/json",
      body: JSON.stringify({
        anthropic_version: "bedrock-2023-05-31",
        max_tokens: 500,
        system: systemPrompt,
        messages,
      }),
    }));

    const responseBody = JSON.parse(Buffer.from(response.body).toString());
    const fullResponse = responseBody.content[0].text;

    const coachMatch = fullResponse.match(/\[COACH:(.*?)\]/s);
    const coachingNote = coachMatch ? coachMatch[1].trim() : null;
    const aiResponse = fullResponse.replace(/\[COACH:.*?\]/s, "").trim();

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        aiResponse,
        coachingNote,
        updatedHistory: [
          ...(conversationHistory || []),
          { role: "user", content: userMessage },
          { role: "assistant", content: aiResponse },
        ],
      }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};