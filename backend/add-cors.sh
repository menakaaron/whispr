#!/bin/bash
CORS_HEADERS='"Access-Control-Allow-Origin":"*","Access-Control-Allow-Headers":"Content-Type,Authorization","Access-Control-Allow-Methods":"GET,POST,OPTIONS"'

for dir in lambda/*/; do
  index="$dir/index.js"
  if [ -f "$index" ]; then
    # Replace existing headers or add CORS to all return statements
    sed -i '' 's/"Content-Type": "application\/json"/"Content-Type": "application\/json","Access-Control-Allow-Origin":"*","Access-Control-Allow-Headers":"Content-Type,Authorization","Access-Control-Allow-Methods":"GET,POST,OPTIONS"/g' "$index"
    echo "Updated $index"
  fi
done
