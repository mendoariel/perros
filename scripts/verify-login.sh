#!/bin/bash
# Script to verify login and profile fetching directly on the server
# Usage: ./verify-login.sh <email> <password>

EMAIL=$1
PASSWORD=$2
BASE_URL="http://localhost:3335" # Corrected port from docker-compose

if [ -z "$EMAIL" ] || [ -z "$PASSWORD" ]; then
  echo "Usage: $0 <email> <password>"
  exit 1
fi

echo "Testing Authentication for $EMAIL..."

# 1. Login
echo "1. Attempting Login..."
# Using -v to see if connection works
RESPONSE=$(curl -s -X POST "$BASE_URL/api/auth/local/signin" \
  -H "Content-Type: application/json" \
  -d "{\"email\": \"$EMAIL\", \"password\": \"$PASSWORD\"}")

# Extract Token
TOKEN=$(echo $RESPONSE | grep -o '"access_token":"[^"]*' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
    echo "❌ Login Failed."
    echo "Response: $RESPONSE"
    exit 1
fi

echo "✅ Login Successful. Token received."
echo "Token (first 20 chars): ${TOKEN:0:20}..."

# 2. Get Profile
echo "2. Fetching Profile (/api/users/me)..."
PROFILE=$(curl -s -X GET "$BASE_URL/api/users/me" \
  -H "Authorization: Bearer $TOKEN")

echo "Response Profile:"
echo $PROFILE

if [[ $PROFILE == *"statusCode\":404"* ]] || [[ $PROFILE == *"Not Found"* ]]; then
    echo "❌ Profile Not Found (404)."
else
    echo "✅ Profile Found!"
fi
