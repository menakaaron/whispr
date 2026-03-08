const { TranscribeClient, GetTranscriptionJobCommand } = require("@aws-sdk/client-transcribe");
const { S3Client, GetObjectCommand } = require("@aws-sdk/client-s3");

const transcribe = new TranscribeClient({ region: "us-east-1" });
const s3 = new S3Client({ region: "us-east-1" });
const BUCKET = "whispr-audio-uploads";

const CORS_HEADERS = {
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type,Authorization",
  "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
};

exports.handler = async (event) => {
  if (event.requestContext?.http?.method === "OPTIONS" || event.httpMethod === "OPTIONS") {
    return { statusCode: 204, headers: CORS_HEADERS, body: "" };
  }

  try {
    const conversationId = event.pathParameters?.conversationId;
    if (!conversationId) {
      return {
        statusCode: 400,
        headers: CORS_HEADERS,
        body: JSON.stringify({ error: "conversationId is required" }),
      };
    }

    const jobName = `whispr-${conversationId}`;
    const jobResponse = await transcribe.send(new GetTranscriptionJobCommand({ TranscriptionJobName: jobName }));

    const job = jobResponse.TranscriptionJob;
    if (!job) {
      return {
        statusCode: 404,
        headers: CORS_HEADERS,
        body: JSON.stringify({ status: "NOT_FOUND", error: "Job not found" }),
      };
    }

    if (job.TranscriptionJobStatus === "FAILED") {
      return {
        statusCode: 200,
        headers: CORS_HEADERS,
        body: JSON.stringify({
          status: "FAILED",
          error: job.FailureReason || "Transcription failed",
        }),
      };
    }

    if (job.TranscriptionJobStatus !== "COMPLETED") {
      return {
        statusCode: 200,
        headers: CORS_HEADERS,
        body: JSON.stringify({ status: "IN_PROGRESS" }),
      };
    }

    const transcriptKey = `transcripts/${conversationId}.json`;
    const s3Response = await s3.send(new GetObjectCommand({ Bucket: BUCKET, Key: transcriptKey }));
    const body = await s3Response.Body.transformToString();
    const data = JSON.parse(body);
    const transcript = data.results?.transcripts?.[0]?.transcript ?? "";

    return {
      statusCode: 200,
      headers: CORS_HEADERS,
      body: JSON.stringify({ status: "COMPLETED", transcript }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers: CORS_HEADERS,
      body: JSON.stringify({ error: error.message }),
    };
  }
};
