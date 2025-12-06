@echo off
REM Helper script to seed the database on Windows
REM Usage: seed.bat [--force]

echo Starting database seeding...
if "%1"=="--force" (
    docker compose exec backend python -m app.seed --force
) else (
    docker compose exec backend python -m app.seed
)

