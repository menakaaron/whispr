#!/bin/bash
for dir in lambda/*/; do
  name=$(basename "$dir")
  echo "Redeploying whispr-$name..."
  cd "$dir"
  rm -f function.zip
  zip -r function.zip index.js node_modules package.json > /dev/null 2>&1
  aws lambda update-function-code \
    --function-name "whispr-$name" \
    --zip-file fileb://function.zip \
    --region us-east-1 > /dev/null 2>&1
  echo "Done: whispr-$name"
  cd ../..
done
