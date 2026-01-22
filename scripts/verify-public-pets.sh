#!/bin/bash

# Base URL
URL="http://localhost:3335"

# Get Public Pets
echo "Fetching public pets (/api/pets)..."
PETS_RESPONSE=$(curl -v -X GET "$URL/api/pets?page=1&limit=10")

echo ""
echo "Public Pets Response:"
echo "$PETS_RESPONSE"
