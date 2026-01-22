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

echo "Login successful. Access Token obtained."

# Create a valid minimal JPEG image (1x1 pixel)
echo "/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAP//////////////////////////////////////////////////////////////////////////////////////wgALCAABAAEBAREA/8QAFBABAAAAAAAAAAAAAAAAAAAAAP/aAAgBAQABPxA=" | base64 -d > test_image.jpg

# Upload Avatar
echo "Uploading avatar..."
UPLOAD_RESPONSE=$(curl -v -X POST "$URL/api/users/me/avatar" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -F "file=@test_image.jpg")

echo ""
echo "Upload Response:"
echo "$UPLOAD_RESPONSE"

# Clean up
rm test_image.jpg
