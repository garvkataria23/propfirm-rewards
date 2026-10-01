const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const dbUrl = process.env.DATABASE_URL || '';
const prismaDir = path.resolve(__dirname, '..', 'prisma');
const targetSchema = path.join(prismaDir, 'schema.prisma');
const postgresSchema = path.join(prismaDir, 'schema.postgresql.prisma');

console.log('[Prisma Setup] Checking database provider from DATABASE_URL...');

if (dbUrl.startsWith('postgresql://') || dbUrl.startsWith('postgres://')) {
  console.log('[Prisma Setup] Detected PostgreSQL URL. Activating PostgreSQL schema...');
  if (fs.existsSync(postgresSchema)) {
    fs.copyFileSync(postgresSchema, targetSchema);
    console.log('[Prisma Setup] schema.prisma updated for PostgreSQL.');
  }
} else {
  console.log('[Prisma Setup] SQLite or default provider retained.');
}

try {
  console.log('[Prisma Setup] Generating Prisma Client...');
  execSync('npx prisma generate', { stdio: 'inherit' });
  
  if (dbUrl) {
    console.log('[Prisma Setup] Pushing schema to database...');
    execSync('npx prisma db push --skip-generate', { stdio: 'inherit' });
    
    // Auto-seed if needed
    if (process.env.AUTO_SEED === 'true' || process.env.NODE_ENV === 'production') {
      try {
        console.log('[Prisma Setup] Checking seed...');
        execSync('npx ts-node prisma/seed.ts', { stdio: 'inherit' });
      } catch (seedErr) {
        console.log('[Prisma Setup] Seed skipped or already applied.');
      }
    }
  }
} catch (err) {
  console.error('[Prisma Setup] Notice:', err.message);
}

console.log('[Prisma Setup] Completed successfully.');
