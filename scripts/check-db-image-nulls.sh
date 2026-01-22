#!/bin/bash

# Connect to DB and query Medals with image column
echo "Querying 'medals' table for rows with NULL image..."
docker exec -t perros_postgres_1 psql -U Silvestre1993 -d peludosclick -c "SELECT id, medal_string, pet_name, image FROM medals WHERE image IS NULL LIMIT 5;"
