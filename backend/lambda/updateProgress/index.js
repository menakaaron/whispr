const { DynamoDBClient, PutItemCommand, GetItemCommand } = require("@aws-sdk/client-dynamodb");

const dynamo = new DynamoDBClient({ region: "us-east-1" });

exports.handler = async (event) => {
  try {
    const body = JSON.parse(event.body);
    const {
      userId,
      hesitationCount,
      avgSpeakingPace,
      volumeConsistency,
      pronunciationScore,
      fluencyScore,
      confidenceScore,
    } = body;

    if (!userId) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "userId is required" }),
      };
    }

    const today = new Date().toISOString().split("T")[0];
    const pk = `USER#${userId}`;
    const sk = `METRIC#${today}`;

    // Check if a record exists for today
    const existing = await dynamo.send(new GetItemCommand({
      TableName: "whispr-progress",
      Key: {
        PK: { S: pk },
        SK: { S: sk },
      },
    }));

    const existingCount = existing.Item 
      ? Number(existing.Item.conversationCount.N) 
      : 0;

    // Calculate running averages if record exists
    const avg = (newVal, oldVal, count) => {
      if (!existing.Item) return newVal || 0;
      return Math.round(((oldVal * count) + newVal) / (count + 1));
    };

    const oldItem = existing.Item;

    await dynamo.send(new PutItemCommand({
      TableName: "whispr-progress",
      Item: {
        PK: { S: pk },
        SK: { S: sk },
        hesitationCount: { N: String((hesitationCount || 0) + (oldItem ? Number(oldItem.hesitationCount.N) : 0)) },
        avgSpeakingPace: { N: String(avg(avgSpeakingPace, oldItem ? Number(oldItem.avgSpeakingPace.N) : 0, existingCount)) },
        volumeConsistency: { N: String(avg(volumeConsistency, oldItem ? Number(oldItem.volumeConsistency.N) : 0, existingCount)) },
        pronunciationScore: { N: String(avg(pronunciationScore, oldItem ? Number(oldItem.pronunciationScore.N) : 0, existingCount)) },
        fluencyScore: { N: String(avg(fluencyScore, oldItem ? Number(oldItem.fluencyScore.N) : 0, existingCount)) },
        confidenceScore: { N: String(avg(confidenceScore, oldItem ? Number(oldItem.confidenceScore.N) : 0, existingCount)) },
        conversationCount: { N: String(existingCount + 1) },
        date: { S: today },
      },
    }));

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json","Access-Control-Allow-Origin":"*","Access-Control-Allow-Headers":"Content-Type,Authorization","Access-Control-Allow-Methods":"GET,POST,OPTIONS" },
      body: JSON.stringify({ success: true, date: today, conversationCount: existingCount + 1 }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};