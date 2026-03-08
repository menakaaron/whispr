const { DynamoDBClient, QueryCommand } = require("@aws-sdk/client-dynamodb");

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

    const result = await client.send(new QueryCommand({
      TableName: "whispr-progress",
      KeyConditionExpression: "PK = :pk",
      ExpressionAttributeValues: {
        ":pk": { S: `USER#${userId}` },
      },
      ScanIndexForward: false,
      Limit: 30,
    }));

    const metrics = result.Items.map(item => ({
      date: item.SK.S.replace("METRIC#", ""),
      hesitationCount: Number(item.hesitationCount?.N || 0),
      avgSpeakingPace: Number(item.avgSpeakingPace?.N || 0),
      pronunciationScore: Number(item.pronunciationScore?.N || 0),
      fluencyScore: Number(item.fluencyScore?.N || 0),
      confidenceScore: Number(item.confidenceScore?.N || 0),
      conversationCount: Number(item.conversationCount?.N || 0),
    }));

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, metrics }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};