const { DynamoDBClient, PutItemCommand } = require("@aws-sdk/client-dynamodb");
const { randomUUID } = require("crypto");

const client = new DynamoDBClient({ region: "us-east-1" });

exports.handler = async (event) => {
  try {
    const body = JSON.parse(event.body);
    const userId = randomUUID();

    const item = {
      PK: { S: `USER#${userId}` },
      SK: { S: "PROFILE" },
      userId: { S: userId },
      email: { S: body.email },
      nativeLanguage: { S: body.nativeLanguage },
      targetLanguage: { S: body.targetLanguage },
      proficiencyLevel: { S: body.proficiencyLevel },
      learningGoals: { L: body.learningGoals.map(g => ({ S: g })) },
      createdAt: { S: new Date().toISOString() },
      lastActiveAt: { S: new Date().toISOString() },
    };

    await client.send(new PutItemCommand({
      TableName: "whispr-users",
      Item: item,
    }));

    return {
      statusCode: 201,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};