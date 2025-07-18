-- RLS Test Script for Docker Container
-- This script tests Row-Level Security implementation

\echo '🔒 Testing Row-Level Security Implementation...'
\echo ''

-- Check RLS status on tables
\echo '📊 Checking RLS status on tables:'
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'vault' 
    AND tablename IN ('tenants', 'products', 'orders', 'order_items')
ORDER BY tablename;

\echo ''

-- Check RLS policies
\echo '🔐 Checking RLS policies:'
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE schemaname = 'vault'
    AND tablename IN ('tenants', 'products', 'orders', 'order_items')
ORDER BY tablename, policyname;

\echo ''

-- Get tenant IDs for testing
\echo '🏢 Getting tenant IDs for testing:'
SELECT id, name, "createdAt" FROM vault.tenants ORDER BY "createdAt";

\echo ''

-- Test 1: Set tenant context to demo tenant
\echo '🎯 Test 1: Setting tenant context to demo tenant...'
SELECT set_config('app.current_tenant_id', (SELECT id::text FROM vault.tenants WHERE name = 'Demo Tenant' LIMIT 1), false) as current_tenant;

\echo '📦 Products visible to demo tenant:'
SELECT id, name, sku, "tenantId" FROM vault.products WHERE "tenantId" = (SELECT id FROM vault.tenants WHERE name = 'Demo Tenant' LIMIT 1);

\echo ''

-- Test 2: Set tenant context to second tenant
\echo '🎯 Test 2: Setting tenant context to second tenant...'
SELECT set_config('app.current_tenant_id', (SELECT id::text FROM vault.tenants WHERE name = 'Second Tenant' LIMIT 1), false) as current_tenant;

\echo '📦 Products visible to second tenant:'
SELECT id, name, sku, "tenantId" FROM vault.products WHERE "tenantId" = (SELECT id FROM vault.tenants WHERE name = 'Second Tenant' LIMIT 1);

\echo ''

-- Test 3: Try to access data without tenant context
\echo '🎯 Test 3: Accessing data without tenant context...'
SELECT set_config('app.current_tenant_id', NULL, false) as current_tenant;

\echo '📦 All products (should be empty due to RLS):'
SELECT id, name, sku, "tenantId" FROM vault.products;

\echo ''

-- Test 4: Verify tenant isolation
\echo '🎯 Test 4: Verifying tenant isolation...'
SELECT set_config('app.current_tenant_id', (SELECT id::text FROM vault.tenants WHERE name = 'Demo Tenant' LIMIT 1), false) as current_tenant;

\echo '📦 Demo tenant products (should only show demo tenant products):'
SELECT id, name, sku, "tenantId" FROM vault.products;

\echo ''

-- Test 5: Check orders and order items
\echo '🎯 Test 5: Checking orders and order items...'
\echo '📋 Orders for demo tenant:'
SELECT id, "tenantId", "totalAmount", status FROM vault.orders WHERE "tenantId" = (SELECT id FROM vault.tenants WHERE name = 'Demo Tenant' LIMIT 1);

\echo '📋 Order items for demo tenant:'
SELECT oi.id, oi.quantity, oi.price, p.name as product_name, oi."orderId"
FROM vault.order_items oi 
JOIN vault.products p ON oi."productId" = p.id 
WHERE oi."orderId" IN (SELECT id FROM vault.orders WHERE "tenantId" = (SELECT id FROM vault.tenants WHERE name = 'Demo Tenant' LIMIT 1));

\echo ''

-- Test 6: Cross-tenant access attempt (should be blocked by RLS)
\echo '🎯 Test 6: Attempting cross-tenant access (should be blocked)...'
SELECT set_config('app.current_tenant_id', (SELECT id::text FROM vault.tenants WHERE name = 'Demo Tenant' LIMIT 1), false) as current_tenant;

\echo '📦 Attempting to access second tenant products (should be empty):'
SELECT id, name, sku, "tenantId" FROM vault.products WHERE "tenantId" = (SELECT id FROM vault.tenants WHERE name = 'Second Tenant' LIMIT 1);

\echo ''
\echo '✅ RLS Testing Complete!' 