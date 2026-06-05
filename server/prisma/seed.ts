import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// ===================================================
// PERMISSIONS SEED
// ===================================================
const PERMISSIONS = [
  // Platform
  { name: 'MANAGE_PLATFORM', description: 'Full platform control', resource: 'platform', action: 'manage' },
  { name: 'MANAGE_ADMINS', description: 'Manage admin users', resource: 'admins', action: 'manage' },
  { name: 'MANAGE_ROLES', description: 'Manage roles', resource: 'roles', action: 'manage' },
  // Users
  { name: 'MANAGE_USERS', description: 'CRUD users', resource: 'users', action: 'manage' },
  { name: 'BAN_USERS', description: 'Ban users', resource: 'users', action: 'ban' },
  { name: 'VIEW_USERS', description: 'View all users', resource: 'users', action: 'read' },
  // Content
  { name: 'MANAGE_DESTINATIONS', description: 'CRUD destinations', resource: 'destinations', action: 'manage' },
  { name: 'MANAGE_ACTIVITIES', description: 'CRUD activities', resource: 'activities', action: 'manage' },
  { name: 'MANAGE_PACKAGES', description: 'CRUD packages', resource: 'packages', action: 'manage' },
  { name: 'PUBLISH_PACKAGES', description: 'Publish packages', resource: 'packages', action: 'publish' },
  { name: 'DELETE_CONTENT', description: 'Delete any content', resource: '*', action: 'delete' },
  // Trips
  { name: 'MANAGE_TRIPS', description: 'Manage any trip', resource: 'trips', action: 'manage' },
  { name: 'CREATE_TRIP', description: 'Create own trips', resource: 'trips', action: 'create' },
  { name: 'VIEW_PUBLIC_TRIPS', description: 'View public trips', resource: 'trips', action: 'read' },
  { name: 'TRIP_SHARING', description: 'Share trips', resource: 'trips', action: 'share' },
  { name: 'UNLIMITED_TRIPS', description: 'Unlimited trips', resource: 'trips', action: 'unlimited' },
  // AI
  { name: 'MANAGE_AI', description: 'Manage AI settings', resource: 'ai', action: 'manage' },
  { name: 'ADVANCED_AI', description: 'Advanced AI features', resource: 'ai', action: 'advanced' },
  // Admin
  { name: 'VIEW_ANALYTICS', description: 'View analytics', resource: 'analytics', action: 'read' },
  { name: 'MANAGE_SUBSCRIPTIONS', description: 'Manage subscriptions', resource: 'subscriptions', action: 'manage' },
  { name: 'MANAGE_SUPPORT', description: 'Manage support tickets', resource: 'support', action: 'manage' },
  { name: 'MODERATE_COMMUNITY', description: 'Moderate community posts', resource: 'community', action: 'moderate' },
  { name: 'MANAGE_SETTINGS', description: 'Manage system settings', resource: 'settings', action: 'manage' },
  { name: 'RESPOND_TO_TRAVELERS', description: 'Respond to travelers', resource: 'community', action: 'respond' },
  { name: 'MANAGE_NOTIFICATIONS', description: 'Send broadcast notifications', resource: 'notifications', action: 'manage' },
];

// ===================================================
// ROLE DEFINITIONS
// ===================================================
const ROLES = [
  {
    name: 'SUPER_ADMIN',
    description: 'Full platform access',
    isSystem: true,
    permissions: PERMISSIONS.map(p => p.name),
  },
  {
    name: 'ADMIN',
    description: 'Platform administrator',
    isSystem: true,
    permissions: [
      'MANAGE_USERS', 'BAN_USERS', 'VIEW_USERS',
      'MANAGE_DESTINATIONS', 'MANAGE_ACTIVITIES', 'MANAGE_PACKAGES', 'PUBLISH_PACKAGES', 'DELETE_CONTENT',
      'MANAGE_TRIPS', 'CREATE_TRIP', 'VIEW_PUBLIC_TRIPS', 'TRIP_SHARING', 'UNLIMITED_TRIPS',
      'MANAGE_AI', 'ADVANCED_AI',
      'VIEW_ANALYTICS', 'MANAGE_SUBSCRIPTIONS', 'MANAGE_SUPPORT', 'MODERATE_COMMUNITY',
      'RESPOND_TO_TRAVELERS', 'MANAGE_NOTIFICATIONS',
    ],
  },
  {
    name: 'CONTENT_MANAGER',
    description: 'Manages destinations and content',
    isSystem: true,
    permissions: [
      'MANAGE_DESTINATIONS', 'MANAGE_ACTIVITIES', 'MANAGE_PACKAGES', 'PUBLISH_PACKAGES',
      'VIEW_PUBLIC_TRIPS', 'MODERATE_COMMUNITY',
    ],
  },
  {
    name: 'TRAVEL_EXPERT',
    description: 'Creates and manages travel packages',
    isSystem: true,
    permissions: [
      'MANAGE_PACKAGES', 'PUBLISH_PACKAGES', 'RESPOND_TO_TRAVELERS',
      'CREATE_TRIP', 'VIEW_PUBLIC_TRIPS', 'TRIP_SHARING', 'UNLIMITED_TRIPS', 'ADVANCED_AI',
    ],
  },
  {
    name: 'PREMIUM_USER',
    description: 'Premium subscription user',
    isSystem: false,
    permissions: [
      'CREATE_TRIP', 'VIEW_PUBLIC_TRIPS', 'TRIP_SHARING', 'UNLIMITED_TRIPS', 'ADVANCED_AI',
    ],
  },
  {
    name: 'USER',
    description: 'Standard user',
    isSystem: false,
    permissions: [
      'CREATE_TRIP', 'VIEW_PUBLIC_TRIPS',
    ],
  },
];

async function main() {
  console.log('🌱 Starting database seed...');

  // 1. Upsert Permissions
  console.log('  → Seeding permissions...');
  for (const perm of PERMISSIONS) {
    await prisma.permission.upsert({
      where: { name: perm.name },
      update: { description: perm.description },
      create: perm,
    });
  }
  console.log(`  ✓ ${PERMISSIONS.length} permissions seeded`);

  // 2. Upsert Roles + assign permissions
  console.log('  → Seeding roles...');
  for (const roleDef of ROLES) {
    const { permissions: permNames, ...roleData } = roleDef;

    const role = await prisma.role.upsert({
      where: { name: roleData.name },
      update: { description: roleData.description },
      create: roleData,
    });

    // Get permission records
    const permRecords = await prisma.permission.findMany({
      where: { name: { in: permNames } },
    });

    // Clear and re-assign
    await prisma.rolePermission.deleteMany({ where: { roleId: role.id } });
    await prisma.rolePermission.createMany({
      data: permRecords.map(p => ({ roleId: role.id, permissionId: p.id })),
      skipDuplicates: true,
    });

    console.log(`    ✓ Role: ${role.name} (${permRecords.length} permissions)`);
  }

  // 3. Create Super Admin User
  console.log('  → Creating super admin user...');
  const superAdminRole = await prisma.role.findUnique({ where: { name: 'SUPER_ADMIN' } });
  if (!superAdminRole) throw new Error('SUPER_ADMIN role not found');

  const email = process.env.SUPER_ADMIN_EMAIL || 'superadmin@traveloop.ai';
  const password = process.env.SUPER_ADMIN_PASSWORD || 'SuperAdmin@123!';
  const name = process.env.SUPER_ADMIN_NAME || 'Super Admin';

  const passwordHash = await bcrypt.hash(password, 12);

  const superAdmin = await prisma.user.upsert({
    where: { email },
    update: {},
    create: {
      email,
      passwordHash,
      name,
      isEmailVerified: true,
      roleId: superAdminRole.id,
    },
  });
  console.log(`  ✓ Super admin: ${superAdmin.email}`);

  // 4. Seed sample countries
  console.log('  → Seeding sample geography...');
  const countries = [
    { name: 'France', code: 'FR', continent: 'Europe' },
    { name: 'Japan', code: 'JP', continent: 'Asia' },
    { name: 'India', code: 'IN', continent: 'Asia' },
    { name: 'United States', code: 'US', continent: 'Americas' },
    { name: 'Italy', code: 'IT', continent: 'Europe' },
    { name: 'Australia', code: 'AU', continent: 'Oceania' },
    { name: 'Brazil', code: 'BR', continent: 'Americas' },
    { name: 'Thailand', code: 'TH', continent: 'Asia' },
  ];

  for (const c of countries) {
    await prisma.country.upsert({ where: { code: c.code }, update: {}, create: c });
  }
  console.log(`  ✓ ${countries.length} countries seeded`);

  // 5. Seed sample cities
  const france = await prisma.country.findUnique({ where: { code: 'FR' } });
  const japan = await prisma.country.findUnique({ where: { code: 'JP' } });

  if (france && japan) {
    const cities = [
      { name: 'Paris', countryId: france.id, latitude: 48.8566, longitude: 2.3522 },
      { name: 'Nice', countryId: france.id, latitude: 43.7102, longitude: 7.262 },
      { name: 'Tokyo', countryId: japan.id, latitude: 35.6762, longitude: 139.6503 },
      { name: 'Kyoto', countryId: japan.id, latitude: 35.0116, longitude: 135.7681 },
    ];

    for (const city of cities) {
      const country = await prisma.country.findUnique({ where: { id: city.countryId } });
      if (country) {
        await prisma.city.upsert({
          where: { name_countryId: { name: city.name, countryId: city.countryId } },
          update: {},
          create: city,
        });
      }
    }
    console.log(`  ✓ Sample cities seeded`);
  }

  console.log('\n✅ Database seeded successfully!');
  console.log(`\n📋 Super Admin Credentials:`);
  console.log(`   Email: ${email}`);
  console.log(`   Password: ${password}`);
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
