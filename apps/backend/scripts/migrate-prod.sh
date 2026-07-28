#!/bin/bash
set -e

echo "Running production migrations..."

# Verify DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
    echo "ERROR: DATABASE_URL is not set"
    exit 1
fi

# Run Prisma migrations
npx prisma migrate deploy

echo "Migrations complete!"
