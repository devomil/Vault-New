import { PrismaClient } from '@prisma/client';
import { RLSManager } from '../src/rls-utils';

/**
 * Test script to verify Row-Level Security (RLS) implementation
 * This script tests tenant data isolation and RLS functionality
 * Designed to run inside Docker container
 */

async function testRLS() {
  // Use vault_app user (non-superuser) to enable RLS
  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: 'postgres://vault_app:vault_app_password@localhost:5432/vault'
      }
    }
  });
  const rlsManager = new RLSManager(prisma);

  console.log('🔒 Testing Row-Level Security Implementation...\n');

  try {
    // Get RLS status for all tables
    console.log('📊 RLS Status for all tables:');
    const rlsStatus = await rlsManager.getRLSStatus();
    rlsStatus.forEach(table => {
      console.log(`  ${table.tableName}: RLS=${table.hasRLS}, Policies=${table.policyCount}`);
    });
    console.log('');

    // Get the demo tenant ID
    const demoTenant = await prisma.tenant.findFirst({
      where: { slug: 'demo-tenant' }
    });
    const secondTenant = await prisma.tenant.findFirst({
      where: { slug: 'second-tenant' }
    });

    if (!demoTenant || !secondTenant) {
      console.log('❌ Both demo and second tenants must exist. Please run the seed script first.');
      return;
    }

    console.log(`🎯 Testing with demo tenant: ${demoTenant.name} (${demoTenant.id})`);
    console.log(`🎯 Testing with second tenant: ${secondTenant.name} (${secondTenant.id})\n`);

    // Test 1: Verify RLS isolation for both tenants
    console.log('🧪 Test 1: RLS Isolation Verification for Both Tenants');
    const demoProducts = await rlsManager.withTenantContext(demoTenant.id, async () => {
      return await prisma.product.findMany();
    });
    const secondProducts = await rlsManager.withTenantContext(secondTenant.id, async () => {
      return await prisma.product.findMany();
    });
    console.log(`  Demo tenant sees ${demoProducts.length} products (should be 2)`);
    console.log(`  Second tenant sees ${secondProducts.length} products (should be 2)`);
    const isolationWorking = demoProducts.every(p => p.tenantId === demoTenant.id) &&
      secondProducts.every(p => p.tenantId === secondTenant.id) &&
      demoProducts.length === 2 && secondProducts.length === 2;
    console.log(`  ✅ Data isolation working: ${isolationWorking}\n`);

    // Test 2: Cross-tenant access prevention
    console.log('🧪 Test 2: Cross-Tenant Data Access Prevention');
    const crossTenantProduct = await rlsManager.withTenantContext(demoTenant.id, async () => {
      return await prisma.product.findFirst({
        where: { tenantId: secondTenant.id }
      });
    });
    console.log(`  Demo tenant can access second tenant's product: ${!!crossTenantProduct}`);
    const crossTenantBlocked = !crossTenantProduct;
    console.log(`  ✅ Cross-tenant access blocked: ${crossTenantBlocked}\n`);

    // Test 3: Tenant context management
    console.log('🧪 Test 3: Tenant Context Management');
    await rlsManager.setTenantContext(demoTenant.id);
    const currentTenantId = await rlsManager.getCurrentTenantId();
    console.log(`  Current tenant context: ${currentTenantId}`);
    console.log(`  ✅ Context set correctly: ${currentTenantId === demoTenant.id}\n`);
    await rlsManager.clearTenantContext();

    // Test 4: withTenantContext Convenience Method
    console.log('🧪 Test 4: withTenantContext Convenience Method');
    const result = await rlsManager.withTenantContext(demoTenant.id, async () => {
      const users = await prisma.user.findMany();
      return users.length;
    });
    console.log(`  Users found using convenience method: ${result}`);
    const contextAfterConvenience = await rlsManager.getCurrentTenantId();
    console.log(`  Context after convenience method: ${contextAfterConvenience}`);
    console.log(`  ✅ Context properly cleared: ${contextAfterConvenience === null}\n`);

    // Summary
    console.log('📋 RLS Test Summary:');
    console.log(`  ✅ Demo tenant sees only their products: ${demoProducts.every(p => p.tenantId === demoTenant.id)}`);
    console.log(`  ✅ Second tenant sees only their products: ${secondProducts.every(p => p.tenantId === secondTenant.id)}`);
    console.log(`  ✅ Cross-tenant access blocked: ${crossTenantBlocked}`);
    console.log(`  ✅ Data isolation working: ${isolationWorking}`);
    console.log(`  ✅ Context management working: ${currentTenantId === demoTenant.id}`);
    console.log(`  ✅ Convenience methods working: ${contextAfterConvenience === null}`);
    
    const allTestsPassed = isolationWorking && crossTenantBlocked &&
      demoProducts.every(p => p.tenantId === demoTenant.id) &&
      secondProducts.every(p => p.tenantId === secondTenant.id) &&
      currentTenantId === demoTenant.id &&
      contextAfterConvenience === null;
    
    console.log(`\n🎉 All RLS tests ${allTestsPassed ? 'PASSED' : 'FAILED'}`);

  } catch (error) {
    console.error('❌ RLS test failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the test if this file is executed directly
if (require.main === module) {
  testRLS().catch(console.error);
}

export { testRLS }; 