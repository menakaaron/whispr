# whispr backend

WhisprAI turns everyday conversations into a personalized coach for language and culture, building confidence in authentic cross-cultural interactions.

## Deploy

**Prerequisites**

- [AWS SAM CLI](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/install-sam-cli.html). Install with `brew install aws-sam-cli` (macOS) or `pip install aws-sam-cli`.
- **AWS credentials** so SAM can deploy. If you see `Error: Unable to locate credentials`:
  - **Option A:** [AWS CLI](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html) + `aws configure` (enter Access Key ID and Secret Access Key from IAM).
  - **Option B:** Environment variables `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY`.
  - **Option C:** IAM role (e.g. on EC2/CodeBuild) or SSO (`aws sso login` if your org uses it).

```bash
cd backend
sam build
sam deploy
```

A `samconfig.toml` is included with stack name `whispr-backend` and region `us-east-1`. To use different settings, run `sam deploy --guided` once to create your own config. After deploy, set the frontend API base URL to the **ApiUrl** stack output.

## Troubleshooting deploy

**ResourceExistenceCheck failed:** Explicit Lambda `FunctionName` values were removed so CloudFormation can assign unique names. If deploy still fails, get the exact validation error:

```bash
CS=$(aws cloudformation list-change-sets --stack-name whispr-backend --query 'Summaries[0].ChangeSetName' --output text)
aws cloudformation describe-events --change-set-name "$CS" --filters FailedEvents=true --query 'OperationEvents[*].{Reason:ValidationStatusReason,Path:ValidationPath}' --output table
```

If the hook reports that a DynamoDB table or S3 bucket does not exist, create `whispr-users`, `whispr-conversations`, `whispr-feedback`, `whispr-progress`, and bucket `whispr-audio-uploads` in the same region before deploying.

## CORS

The API must send CORS headers so the frontend (e.g. `http://localhost:3000`) can call it. Each Lambda includes `Access-Control-Allow-Origin: *` (and related headers) on every response. If you still see CORS errors:

1. Redeploy the backend so the updated Lambda code (with CORS on 400/404/500) is live.
2. If using SAM, ensure `Globals.Api.Cors` is set in `template.yml` so API Gateway handles OPTIONS preflight.
3. In API Gateway console you can also enable CORS on the API (e.g. "Enable CORS" on the resource).
