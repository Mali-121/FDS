#!/bin/bash
# Helper script to seed the database
# Usage: ./seed.sh [--force]

echo "Starting database seeding..."
if [ "$1" == "--force" ]; then
    docker compose exec backend python -m app.seed --force
else
    docker compose exec backend python -m app.seed
fi

