-- Apply Row-Level Security (RLS) Policies
-- Run this script to enable RLS on all tenant-specific tables

-- Enable RLS on all tenant-specific tables
ALTER TABLE vault.tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE vault.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE vault.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE vault.product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE vault.marketplaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE vault.marketplace_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE vault.marketplace_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE vault.vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE vault.vendor_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE vault.vendor_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE vault.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE vault.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE vault.pricing_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE vault.inventory ENABLE ROW LEVEL SECURITY;

-- Create tenant context function
CREATE OR REPLACE FUNCTION vault.get_tenant_id()
RETURNS TEXT AS $$
BEGIN
    -- Get tenant ID from application context
    -- This will be set by the application before queries
    RETURN current_setting('app.tenant_id', true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create RLS policies for each table

-- Tenants table - users can only see their own tenant
CREATE POLICY tenant_isolation_policy ON vault.tenants
    FOR ALL USING (id = vault.get_tenant_id());

-- Users table - users can only see users in their tenant
CREATE POLICY user_tenant_isolation_policy ON vault.users
    FOR ALL USING (tenant_id = vault.get_tenant_id());

-- Products table - users can only see products in their tenant
CREATE POLICY product_tenant_isolation_policy ON vault.products
    FOR ALL USING (tenant_id = vault.get_tenant_id());

-- Product variants table - users can only see variants of their tenant's products
CREATE POLICY product_variant_tenant_isolation_policy ON vault.product_variants
    FOR ALL USING (
        product_id IN (
            SELECT id FROM vault.products 
            WHERE tenant_id = vault.get_tenant_id()
        )
    );

-- Marketplaces table - users can only see marketplaces in their tenant
CREATE POLICY marketplace_tenant_isolation_policy ON vault.marketplaces
    FOR ALL USING (tenant_id = vault.get_tenant_id());

-- Marketplace listings table - users can only see listings in their tenant
CREATE POLICY marketplace_listing_tenant_isolation_policy ON vault.marketplace_listings
    FOR ALL USING (tenant_id = vault.get_tenant_id());

-- Marketplace orders table - users can only see orders in their tenant
CREATE POLICY marketplace_order_tenant_isolation_policy ON vault.marketplace_orders
    FOR ALL USING (tenant_id = vault.get_tenant_id());

-- Vendors table - users can only see vendors in their tenant
CREATE POLICY vendor_tenant_isolation_policy ON vault.vendors
    FOR ALL USING (tenant_id = vault.get_tenant_id());

-- Vendor products table - users can only see vendor products in their tenant
CREATE POLICY vendor_product_tenant_isolation_policy ON vault.vendor_products
    FOR ALL USING (tenant_id = vault.get_tenant_id());

-- Vendor orders table - users can only see vendor orders in their tenant
CREATE POLICY vendor_order_tenant_isolation_policy ON vault.vendor_orders
    FOR ALL USING (tenant_id = vault.get_tenant_id());

-- Orders table - users can only see orders in their tenant
CREATE POLICY order_tenant_isolation_policy ON vault.orders
    FOR ALL USING (tenant_id = vault.get_tenant_id());

-- Order items table - users can only see order items in their tenant
CREATE POLICY order_item_tenant_isolation_policy ON vault.order_items
    FOR ALL USING (tenant_id = vault.get_tenant_id());

-- Pricing rules table - users can only see pricing rules in their tenant
CREATE POLICY pricing_rule_tenant_isolation_policy ON vault.pricing_rules
    FOR ALL USING (tenant_id = vault.get_tenant_id());

-- Inventory table - users can only see inventory in their tenant
CREATE POLICY inventory_tenant_isolation_policy ON vault.inventory
    FOR ALL USING (tenant_id = vault.get_tenant_id());

-- Create a function to set tenant context
CREATE OR REPLACE FUNCTION vault.set_tenant_context(tenant_id TEXT)
RETURNS VOID AS $$
BEGIN
    -- Set the tenant ID in the session context
    PERFORM set_config('app.tenant_id', tenant_id, false);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a function to clear tenant context
CREATE OR REPLACE FUNCTION vault.clear_tenant_context()
RETURNS VOID AS $$
BEGIN
    -- Clear the tenant ID from session context
    PERFORM set_config('app.tenant_id', '', false);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION vault.get_tenant_id() TO vault;
GRANT EXECUTE ON FUNCTION vault.set_tenant_context(TEXT) TO vault;
GRANT EXECUTE ON FUNCTION vault.clear_tenant_context() TO vault;

-- Verify RLS is enabled
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'vault' 
ORDER BY tablename; 