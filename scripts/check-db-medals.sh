#!/bin/bash

# Connect to DB and list tables
echo "Listing all tables..."
docker exec -t perros_postgres_1 psql -U Silvestre1993 -d peludosclick -c "\dt"

echo ""
echo "Querying 'medals' table..."
docker exec -t perros_postgres_1 psql -U Silvestre1993 -d peludosclick -c "SELECT id, medal_string, status, pet_name FROM medals LIMIT 5;"
