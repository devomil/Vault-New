-- Initialize Vault Database
-- This script runs when the PostgreSQL container starts for the first time

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements";

-- Create schema for better organization
CREATE SCHEMA IF NOT EXISTS vault;

-- Set default search path
ALTER DATABASE vault SET search_path TO vault, public;

-- Create initial roles (if needed for future use)
-- DO $$
-- BEGIN
--     IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'vault_app') THEN
--         CREATE ROLE vault_app WITH LOGIN PASSWORD 'vault_app_pass';
--     END IF;
-- END
-- $$;

-- Grant necessary permissions
GRANT ALL PRIVILEGES ON SCHEMA vault TO vault;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA vault TO vault;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA vault TO vault;

-- Set default privileges for future objects
ALTER DEFAULT PRIVILEGES IN SCHEMA vault GRANT ALL ON TABLES TO vault;
ALTER DEFAULT PRIVILEGES IN SCHEMA vault GRANT ALL ON SEQUENCES TO vault;

-- Log initialization
INSERT INTO pg_stat_statements_info (dealloc) VALUES (0) ON CONFLICT DO NOTHING; 