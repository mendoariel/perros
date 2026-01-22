#!/bin/bash

# Base URL
URL="http://localhost:3335"

# Register/Login
EMAIL="mendoariel@hotmail.com"
PASSWORD="Casadesara1"

echo "Logging in..."
LOGIN_RESPONSE=$(curl -s -X POST "$URL/api/auth/local/signin" \
  -H "Content-Type: application/json" \
  -d "{\"email\": \"$EMAIL\", \"password\": \"$PASSWORD\"}")

# Extract Access Token
ACCESS_TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"access_token":"[^"]*' | cut -d'"' -f4)

if [ -z "$ACCESS_TOKEN" ]; then
  echo "Login failed. Response:"
  echo "$LOGIN_RESPONSE"
  exit 1
fi

echo "Login successful."

# Get My Pets
echo "Fetching my pets (/api/pets/mine)..."
PETS_RESPONSE=$(curl -v -X GET "$URL/api/pets/mine" \
  -H "Authorization: Bearer $ACCESS_TOKEN")

echo ""
echo "Pets Response:"
echo "$PETS_RESPONSE"
