const { DynamoDBClient, PutItemCommand } = require("@aws-sdk/client-dynamodb");
const { randomUUID } = require("crypto");

const client = new DynamoDBClient({ region: "us-east-1" });

const CORS_HEADERS = {
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type,Authorization",
  "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
};

exports.handler = async (event) => {
  // Handle CORS preflight
  if (event.requestContext?.http?.method === "OPTIONS" || event.httpMethod === "OPTIONS") {
    return { statusCode: 204, headers: CORS_HEADERS, body: "" };
  }

  try {
    const body = JSON.parse(event.body);
    const { userId, transcriptRaw, durationSeconds, context } = body;

    if (!userId || !transcriptRaw) {
      return {
        statusCode: 400,
        headers: CORS_HEADERS,
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
      headers: CORS_HEADERS,
      body: JSON.stringify({ conversationId, createdAt: timestamp }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers: CORS_HEADERS,
      body: JSON.stringify({ error: error.message }),
    };
  }
};