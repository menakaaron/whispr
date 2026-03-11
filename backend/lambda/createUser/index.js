const { DynamoDBClient, PutItemCommand } = require("@aws-sdk/client-dynamodb");

const client = new DynamoDBClient({ region: "us-east-1" });

exports.handler = async (event) => {
  try {
    const body = JSON.parse(event.body);
    
    // Get userId from Cognito JWT (if authenticated) or use provided userId
    let userId = body.userId;
    if (!userId && event.requestContext?.authorizer?.claims?.sub) {
      userId = event.requestContext.authorizer.claims.sub;
    }
    if (!userId) {
      return {
        statusCode: 400,
        headers: { "Content-Type": "application/json","Access-Control-Allow-Origin":"*","Access-Control-Allow-Headers":"Content-Type,Authorization","Access-Control-Allow-Methods":"GET,POST,OPTIONS" },
        body: JSON.stringify({ error: "userId is required" }),
      };
    }

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
      headers: { "Content-Type": "application/json","Access-Control-Allow-Origin":"*","Access-Control-Allow-Headers":"Content-Type,Authorization","Access-Control-Allow-Methods":"GET,POST,OPTIONS" },
      body: JSON.stringify({ userId }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json","Access-Control-Allow-Origin":"*","Access-Control-Allow-Headers":"Content-Type,Authorization","Access-Control-Allow-Methods":"GET,POST,OPTIONS" },
      body: JSON.stringify({ error: error.message }),
    };
  }
};