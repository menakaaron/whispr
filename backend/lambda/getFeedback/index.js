const { DynamoDBClient, QueryCommand } = require("@aws-sdk/client-dynamodb");

const dynamo = new DynamoDBClient({ region: "us-east-1" });

exports.handler = async (event) => {
  try {
    const conversationId = event.pathParameters?.conversationId;

    if (!conversationId) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "conversationId is required" }),
      };
    }

    const result = await dynamo.send(new QueryCommand({
      TableName: "whispr-feedback",
      KeyConditionExpression: "PK = :pk",
      ExpressionAttributeValues: {
        ":pk": { S: `CONVO#${conversationId}` },
      },
    }));

    const feedback = result.Items.map(item => ({
      feedbackType: item.feedbackType.S,
      insights: item.insights?.L.map(i => {
        try { return JSON.parse(i.S); } catch { return i.S; }
      }) || [],
      socialNorms: item.socialNorms?.L.map(n => n.S) || [],
      fluencyNotes: item.fluencyNotes?.L.map(n => n.S) || [],
      suggestions: item.suggestions?.L.map(s => s.S) || [],
      generatedBy: item.generatedBy?.S,
      createdAt: item.createdAt?.S,
    }));

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json","Access-Control-Allow-Origin":"*","Access-Control-Allow-Headers":"Content-Type,Authorization","Access-Control-Allow-Methods":"GET,POST,OPTIONS" },
      body: JSON.stringify({ conversationId, feedback }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};