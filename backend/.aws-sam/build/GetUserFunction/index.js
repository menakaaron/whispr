const { DynamoDBClient, GetItemCommand } = require("@aws-sdk/client-dynamodb");

const client = new DynamoDBClient({ region: "us-east-1" });

exports.handler = async (event) => {
  try {
    const userId = event.pathParameters?.userId;

    if (!userId) {
      return {
        statusCode: 400,
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
        body: JSON.stringify({ error: "User not found" }),
      };
    }

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
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
      body: JSON.stringify({ error: error.message }),
    };
  }
};