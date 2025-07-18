-- Fix RLS by creating a non-superuser role for the application
-- The current 'vault' user has superuser privileges which bypass RLS

-- Create a new role for the application
CREATE ROLE vault_app WITH LOGIN PASSWORD 'vault_app_password';

-- Grant necessary permissions to the new role
GRANT CONNECT ON DATABASE vault TO vault_app;
GRANT USAGE ON SCHEMA vault TO vault_app;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA vault TO vault_app;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA vault TO vault_app;

-- Grant execute permissions on the tenant context functions
GRANT EXECUTE ON FUNCTION vault.get_tenant_id() TO vault_app;
GRANT EXECUTE ON FUNCTION vault.set_tenant_context(TEXT) TO vault_app;
GRANT EXECUTE ON FUNCTION vault.clear_tenant_context() TO vault_app;

-- Set default privileges for future tables
ALTER DEFAULT PRIVILEGES IN SCHEMA vault GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO vault_app;
ALTER DEFAULT PRIVILEGES IN SCHEMA vault GRANT USAGE, SELECT ON SEQUENCES TO vault_app;

-- Verify the new role
SELECT rolname, rolsuper, rolinherit FROM pg_roles WHERE rolname = 'vault_app'; 