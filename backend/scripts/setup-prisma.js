const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const dbUrl = process.env.DATABASE_URL || '';
const prismaDir = path.resolve(__dirname, '..', 'prisma');
const targetSchema = path.join(prismaDir, 'schema.prisma');
const postgresSchema = path.join(prismaDir, 'schema.postgresql.prisma');

console.log('[Build Setup] Preparing Prisma schema...');

if (dbUrl.startsWith('postgresql://') || dbUrl.startsWith('postgres://')) {
  console.log('[Build Setup] Detected PostgreSQL URL. Using PostgreSQL schema...');
  if (fs.existsSync(postgresSchema)) {
    fs.copyFileSync(postgresSchema, targetSchema);
    console.log('[Build Setup] schema.prisma copied from schema.postgresql.prisma.');
  }
} else {
  console.log('[Build Setup] Using default schema.');
}

console.log('[Build Setup] Generating Prisma Client...');
execSync('npx prisma generate', { stdio: 'inherit' });
console.log('[Build Setup] Prisma Client generated successfully.');
