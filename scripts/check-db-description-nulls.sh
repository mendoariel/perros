#!/bin/bash

# Connect to DB and query Medals with description column
echo "Querying 'medals' table for rows with NULL description or pet_name..."
docker exec -t perros_postgres_1 psql -U Silvestre1993 -d peludosclick -c "SELECT id, medal_string, pet_name, description FROM medals WHERE description IS NULL OR pet_name IS NULL LIMIT 5;"
