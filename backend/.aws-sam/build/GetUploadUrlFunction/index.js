const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
const { randomUUID } = require("crypto");

const s3 = new S3Client({ region: "us-east-1" });

const CORS_HEADERS = {
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type,Authorization",
  "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
};

exports.handler = async (event) => {
  // Handle CORS preflight so browser allows POST from localhost
  if (event.requestContext?.http?.method === "OPTIONS" || event.httpMethod === "OPTIONS") {
    return { statusCode: 204, headers: CORS_HEADERS, body: "" };
  }

  try {
    const body = JSON.parse(event.body || "{}");
    const { userId, contentType } = body;

    if (!userId) {
      return {
        statusCode: 400,
        headers: CORS_HEADERS,
        body: JSON.stringify({ error: "userId is required" }),
      };
    }

    const fileId = randomUUID();
    const s3Key = `audio/${userId}/${fileId}.mp4`;

    const command = new PutObjectCommand({
      Bucket: "whispr-audio-uploads",
      Key: s3Key,
      ContentType: contentType || "audio/mp4",
    });

    const uploadUrl = await getSignedUrl(s3, command, { expiresIn: 300 });

    return {
      statusCode: 200,
      headers: CORS_HEADERS,
      body: JSON.stringify({ uploadUrl, s3Key, fileId }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers: CORS_HEADERS,
      body: JSON.stringify({ error: error.message }),
    };
  }
};