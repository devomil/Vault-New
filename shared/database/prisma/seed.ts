import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Create a sample tenant
  const tenant = await prisma.tenant.upsert({
    where: { slug: 'demo-tenant' },
    update: {},
    create: {
      name: 'Demo Tenant',
      slug: 'demo-tenant',
      status: 'active',
      configuration: {
        marketplaces: [],
        vendors: [],
        pricing: {
          defaultMarkup: 15,
          mapEnforcement: true,
          governmentPricing: false,
          competitivePricing: false,
          autoRepricing: false,
        },
        inventory: {
          lowStockThreshold: 10,
          reorderPoint: 5,
          safetyStock: 20,
          autoReorder: false,
        },
        notifications: {
          email: true,
          sms: false,
          webhook: false,
        },
      },
    },
  });

  console.log('✅ Created tenant:', tenant.name);

  // Create a sample user
  const user = await prisma.user.upsert({
    where: { 
      tenantId_email: {
        tenantId: tenant.id,
        email: 'admin@demo-tenant.com'
      }
    },
    update: {},
    create: {
      tenantId: tenant.id,
      email: 'admin@demo-tenant.com',
      firstName: 'Demo',
      lastName: 'Admin',
      role: 'admin',
      status: 'active',
    },
  });

  console.log('✅ Created user:', user.email);

  // Create sample products
  const products = await Promise.all([
    prisma.product.upsert({
      where: { 
        tenantId_sku: {
          tenantId: tenant.id,
          sku: 'DEMO-001'
        }
      },
      update: {},
      create: {
        tenantId: tenant.id,
        sku: 'DEMO-001',
        name: 'Sample Product 1',
        description: 'This is a sample product for testing',
        category: 'Electronics',
        brand: 'Demo Brand',
        status: 'active',
        attributes: {
          weight: '1.5kg',
          dimensions: '10x5x2cm',
          color: 'Black',
        },
        images: ['https://example.com/image1.jpg'],
      },
    }),
    prisma.product.upsert({
      where: { 
        tenantId_sku: {
          tenantId: tenant.id,
          sku: 'DEMO-002'
        }
      },
      update: {},
      create: {
        tenantId: tenant.id,
        sku: 'DEMO-002',
        name: 'Sample Product 2',
        description: 'Another sample product for testing',
        category: 'Electronics',
        brand: 'Demo Brand',
        status: 'active',
        attributes: {
          weight: '2.0kg',
          dimensions: '15x8x3cm',
          color: 'White',
        },
        images: ['https://example.com/image2.jpg'],
      },
    }),
  ]);

  console.log('✅ Created products:', products.length);

  // Create sample inventory
  await Promise.all(
    products.map((product) =>
      prisma.inventory.upsert({
        where: { productId: product.id },
        update: {},
        create: {
          tenantId: tenant.id,
          productId: product.id,
          quantity: 100,
          reserved: 0,
          available: 100,
          lowStockThreshold: 10,
          reorderPoint: 5,
          safetyStock: 20,
        },
      })
    )
  );

  console.log('✅ Created inventory records');

  // Create sample marketplace
  const marketplace = await prisma.marketplace.upsert({
    where: { 
      tenantId_marketplaceId: {
        tenantId: tenant.id,
        marketplaceId: 'amazon-demo'
      }
    },
    update: {},
    create: {
      tenantId: tenant.id,
      marketplaceId: 'amazon-demo',
      name: 'Amazon Demo',
      type: 'amazon',
      status: 'active',
      settings: {
        region: 'US',
        marketplaceId: 'ATVPDKIKX0DER',
      },
    },
  });

  console.log('✅ Created marketplace:', marketplace.name);

  // Create sample vendor
  const vendor = await prisma.vendor.upsert({
    where: { 
      tenantId_vendorId: {
        tenantId: tenant.id,
        vendorId: 'ingram-demo'
      }
    },
    update: {},
    create: {
      tenantId: tenant.id,
      vendorId: 'ingram-demo',
      name: 'Ingram Micro Demo',
      type: 'ingram',
      status: 'active',
      settings: {
        region: 'US',
        warehouse: 'CA',
      },
    },
  });

  console.log('✅ Created vendor:', vendor.name);

  // ----------------------
  // SECOND TENANT & DATA
  // ----------------------
  const tenant2 = await prisma.tenant.upsert({
    where: { slug: 'second-tenant' },
    update: {},
    create: {
      name: 'Second Tenant',
      slug: 'second-tenant',
      status: 'active',
      configuration: {},
    },
  });
  console.log('✅ Created second tenant:', tenant2.name);

  const user2 = await prisma.user.upsert({
    where: {
      tenantId_email: {
        tenantId: tenant2.id,
        email: 'admin@second-tenant.com',
      },
    },
    update: {},
    create: {
      tenantId: tenant2.id,
      email: 'admin@second-tenant.com',
      firstName: 'Second',
      lastName: 'Admin',
      role: 'admin',
      status: 'active',
    },
  });
  console.log('✅ Created user for second tenant:', user2.email);

  const products2 = await Promise.all([
    prisma.product.upsert({
      where: {
        tenantId_sku: {
          tenantId: tenant2.id,
          sku: 'SECOND-001',
        },
      },
      update: {},
      create: {
        tenantId: tenant2.id,
        sku: 'SECOND-001',
        name: 'Second Tenant Product 1',
        description: 'Product for second tenant',
        category: 'Books',
        brand: 'Second Brand',
        status: 'active',
        attributes: {
          weight: '0.5kg',
          dimensions: '5x5x1cm',
          color: 'Blue',
        },
        images: ['https://example.com/second1.jpg'],
      },
    }),
    prisma.product.upsert({
      where: {
        tenantId_sku: {
          tenantId: tenant2.id,
          sku: 'SECOND-002',
        },
      },
      update: {},
      create: {
        tenantId: tenant2.id,
        sku: 'SECOND-002',
        name: 'Second Tenant Product 2',
        description: 'Another product for second tenant',
        category: 'Books',
        brand: 'Second Brand',
        status: 'active',
        attributes: {
          weight: '0.7kg',
          dimensions: '6x6x2cm',
          color: 'Red',
        },
        images: ['https://example.com/second2.jpg'],
      },
    }),
  ]);
  console.log('✅ Created products for second tenant:', products2.length);

  await Promise.all(
    products2.map((product) =>
      prisma.inventory.upsert({
        where: { productId: product.id },
        update: {},
        create: {
          tenantId: tenant2.id,
          productId: product.id,
          quantity: 50,
          reserved: 0,
          available: 50,
          lowStockThreshold: 5,
          reorderPoint: 2,
          safetyStock: 10,
        },
      })
    )
  );
  console.log('✅ Created inventory records for second tenant');

  console.log('🎉 Database seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 