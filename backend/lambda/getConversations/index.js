const { DynamoDBClient, QueryCommand } = require("@aws-sdk/client-dynamodb");

const dynamo = new DynamoDBClient({ region: "us-east-1" });

exports.handler = async (event) => {
  try {
    const userId = event.pathParameters?.userId;

    if (!userId) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "userId is required" }),
      };
    }

    const result = await dynamo.send(new QueryCommand({
      TableName: "whispr-conversations",
      KeyConditionExpression: "PK = :pk AND begins_with(SK, :sk)",
      ExpressionAttributeValues: {
        ":pk": { S: `USER#${userId}` },
        ":sk": { S: "CONVO#" },
      },
      ScanIndexForward: false,
      Limit: 20,
    }));

    const conversations = result.Items.map(item => ({
      conversationId: item.conversationId.S,
      context: item.context?.S || "general",
      durationSeconds: Number(item.durationSeconds?.N || 0),
      feedbackStatus: item.feedbackStatus?.S || "pending",
      createdAt: item.createdAt.S,
    }));

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json","Access-Control-Allow-Origin":"*","Access-Control-Allow-Headers":"Content-Type,Authorization","Access-Control-Allow-Methods":"GET,POST,OPTIONS" },
      body: JSON.stringify({ userId, conversations }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};