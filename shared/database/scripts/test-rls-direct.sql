-- Test RLS directly in the database
-- This script tests if RLS policies are working correctly for both tenants

-- Set tenant context to demo tenant
SELECT vault.set_tenant_context('cmctf7n2b00001uwobj1owfd5');
SELECT 'Current tenant context (demo):' as info, vault.get_tenant_id() as tenant_id;
SELECT 'Products visible to demo tenant:' as info, COUNT(*) as count FROM vault.products;
SELECT 'Product IDs visible to demo tenant:' as info, array_agg(id) FROM vault.products;

-- Set tenant context to second tenant
SELECT vault.set_tenant_context('cmcthbzyf000f1udwzh102ngr');
SELECT 'Current tenant context (second):' as info, vault.get_tenant_id() as tenant_id;
SELECT 'Products visible to second tenant:' as info, COUNT(*) as count FROM vault.products;
SELECT 'Product IDs visible to second tenant:' as info, array_agg(id) FROM vault.products;

-- Clear tenant context
SELECT vault.clear_tenant_context();
SELECT 'Products visible with no tenant context:' as info, COUNT(*) as count FROM vault.products;

-- Test tenants table with RLS
SELECT 'Tenants with RLS (should be 1):' as info, COUNT(*) as count FROM vault.tenants;

-- Test users table with RLS
SELECT 'Users with RLS (should be 1):' as info, COUNT(*) as count FROM vault.users; 