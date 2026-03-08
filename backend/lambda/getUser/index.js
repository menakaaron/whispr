const { DynamoDBClient, GetItemCommand } = require("@aws-sdk/client-dynamodb");

const client = new DynamoDBClient({ region: "us-east-1" });

const CORS_HEADERS = {
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type,Authorization",
  "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
};

exports.handler = async (event) => {
  // Handle CORS preflight so browser allows GET from localhost
  if (event.requestContext?.http?.method === "OPTIONS" || event.httpMethod === "OPTIONS") {
    return { statusCode: 204, headers: CORS_HEADERS, body: "" };
  }

  try {
    const userId = event.pathParameters?.userId;

    if (!userId) {
      return {
        statusCode: 400,
        headers: CORS_HEADERS,
        body: JSON.stringify({ error: "userId is required" }),
      };
    }

    const result = await client.send(new GetItemCommand({
      TableName: "whispr-users",
      Key: {
        PK: { S: `USER#${userId}` },
        SK: { S: "PROFILE" },
      },
    }));

    if (!result.Item) {
      return {
        statusCode: 404,
        headers: CORS_HEADERS,
        body: JSON.stringify({ error: "User not found" }),
      };
    }

    return {
      statusCode: 200,
      headers: CORS_HEADERS,
      body: JSON.stringify({
        userId: result.Item.userId.S,
        email: result.Item.email.S,
        nativeLanguage: result.Item.nativeLanguage.S,
        targetLanguage: result.Item.targetLanguage.S,
        proficiencyLevel: result.Item.proficiencyLevel.S,
        learningGoals: result.Item.learningGoals.L.map(g => g.S),
        createdAt: result.Item.createdAt.S,
        lastActiveAt: result.Item.lastActiveAt.S,
      }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers: CORS_HEADERS,
      body: JSON.stringify({ error: error.message }),
    };
  }
};