#!/bin/sh

echo "================================================"
echo "Starting Backend Initialization..."
echo "================================================"

# Prisma needs to push the schema into the empty MySQL database on first startup
echo "Synchronizing Prisma schema with the database..."
npx prisma db push --accept-data-loss

# Seed the database with mock data if it's empty
echo "Running Prisma seed..."
npx prisma db seed

echo "Database initialization complete!"
echo "Starting Express Server..."

# Replace shell with Node process (PID 1)
exec node server.js
