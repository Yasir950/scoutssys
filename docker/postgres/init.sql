-- PostgreSQL initialization script
-- Prisma migrations handle schema; this file creates the DB if not exists

SELECT 'CREATE DATABASE scouts_db'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'scouts_db')\gexec

-- Enable pg_trgm for fuzzy text search on scouts
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
