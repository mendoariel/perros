#!/bin/sh
# wait-for-db.sh

set -e

echo "Waiting for database..."
until PGPASSWORD=casadesara psql -h postgres -U mendoariel -d peludosclick -c '\q'; do
  >&2 echo "Postgres is unavailable - sleeping"
  sleep 1
done

>&2 echo "Postgres is up - executing migrations"
npx prisma migrate deploy

exec "$@" 