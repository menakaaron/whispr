const { DynamoDBClient, PutItemCommand } = require("@aws-sdk/client-dynamodb");

const client = new DynamoDBClient({ region: "us-east-1" });

exports.handler = async (event) => {
  try {
    const body = JSON.parse(event.body);
    const { conversationId, feedbackType, insights, suggestions, severity, generatedBy } = body;

    if (!conversationId || !feedbackType) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "conversationId and feedbackType are required" }),
      };
    }

    await client.send(new PutItemCommand({
      TableName: "whispr-feedback",
      Item: {
        PK: { S: `CONVO#${conversationId}` },
        SK: { S: `FEEDBACK#${feedbackType}` },
        feedbackType: { S: feedbackType },
        insights: { L: (insights || []).map(i => ({ S: i })) },
        suggestions: { L: (suggestions || []).map(s => ({ S: s })) },
        severity: { S: severity || "info" },
        generatedBy: { S: generatedBy || "bedrock-claude-haiku" },
        createdAt: { S: new Date().toISOString() },
      },
    }));

    return {
      statusCode: 201,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ success: true, conversationId, feedbackType }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};