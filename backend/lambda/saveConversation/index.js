const { DynamoDBClient, PutItemCommand } = require("@aws-sdk/client-dynamodb");
const { randomUUID } = require("crypto");

const client = new DynamoDBClient({ region: "us-east-1" });

exports.handler = async (event) => {
  try {
    const body = JSON.parse(event.body);
    const { userId, transcriptRaw, durationSeconds, context } = body;

    if (!userId || !transcriptRaw) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "userId and transcriptRaw are required" }),
      };
    }

    const conversationId = randomUUID();
    const timestamp = new Date().toISOString();

    await client.send(new PutItemCommand({
      TableName: "whispr-conversations",
      Item: {
        PK: { S: `USER#${userId}` },
        SK: { S: `CONVO#${timestamp}` },
        conversationId: { S: conversationId },
        transcriptRaw: { S: transcriptRaw },
        durationSeconds: { N: String(durationSeconds || 0) },
        context: { S: context || "general" },
        feedbackStatus: { S: "pending" },
        createdAt: { S: timestamp },
      },
    }));

    return {
      statusCode: 201,
      headers: { "Content-Type": "application/json","Access-Control-Allow-Origin":"*","Access-Control-Allow-Headers":"Content-Type,Authorization","Access-Control-Allow-Methods":"GET,POST,OPTIONS" },
      body: JSON.stringify({ conversationId, createdAt: timestamp }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};