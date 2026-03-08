const { TranscribeClient, StartTranscriptionJobCommand, GetTranscriptionJobCommand } = require("@aws-sdk/client-transcribe");
const { DynamoDBClient, UpdateItemCommand } = require("@aws-sdk/client-dynamodb");

const transcribe = new TranscribeClient({ region: "us-east-1" });
const dynamo = new DynamoDBClient({ region: "us-east-1" });

const CORS_HEADERS = { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "Content-Type,Authorization", "Access-Control-Allow-Methods": "GET,POST,OPTIONS" };

exports.handler = async (event) => {
  if (event.requestContext?.http?.method === "OPTIONS" || event.httpMethod === "OPTIONS") {
    return { statusCode: 204, headers: CORS_HEADERS, body: "" };
  }

  try {
    const body = JSON.parse(event.body || "{}");
    const { s3Key, userId, conversationId, createdAt, languageCode } = body;

    if (!s3Key || !userId || !conversationId) {
      return {
        statusCode: 400,
        headers: CORS_HEADERS,
        body: JSON.stringify({ error: "s3Key, userId and conversationId are required" }),
      };
    }

    const jobName = `whispr-${conversationId}`;
    const s3Uri = `s3://whispr-audio-uploads/${s3Key}`;

    await transcribe.send(new StartTranscriptionJobCommand({
      TranscriptionJobName: jobName,
      LanguageCode: languageCode || "en-US",
      MediaFormat: body.mediaFormat || "mp4",
      Media: { MediaFileUri: s3Uri },
      OutputBucketName: "whispr-audio-uploads",
      OutputKey: `transcripts/${conversationId}.json`,
    }));

    return {
      statusCode: 200,
      headers: CORS_HEADERS,
      body: JSON.stringify({ 
        message: "Transcription job started",
        jobName,
        conversationId,
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