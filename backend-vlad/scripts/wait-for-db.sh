#!/bin/sh
# wait-for-db.sh

set -e

echo "Waiting for database..."
until PGPASSWORD=iendlshLANDHG423423480 psql -h postgres -U Silvestre1993 -d peludosclick -c '\q'; do
  >&2 echo "Postgres is unavailable - sleeping"
  sleep 1
done

>&2 echo "Postgres is up - executing migrations"
npx prisma migrate deploy

exec "$@" 