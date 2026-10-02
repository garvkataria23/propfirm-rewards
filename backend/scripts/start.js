const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('==================================================');
console.log('🚀 PropFirm Rewards Backend Starting (Production Hardened)...');
console.log('==================================================');

const isProduction = process.env.NODE_ENV === 'production';
const dbUrl = process.env.DATABASE_URL || '';

if (dbUrl) {
  try {
    if (isProduction) {
      console.log('[Runtime] Production mode detected. Applying migrations safely...');
      // In production, execute prisma migrate deploy if migrations directory exists, or non-destructive db push
      const migrationsDir = path.resolve(__dirname, '..', 'prisma', 'migrations');
      if (fs.existsSync(migrationsDir)) {
        execSync('npx prisma migrate deploy', { stdio: 'inherit' });
        console.log('[Runtime] Migrations applied safely via prisma migrate deploy.');
      } else {
        // Safe push without data loss
        execSync('npx prisma db push --skip-generate', { stdio: 'inherit' });
        console.log('[Runtime] Schema synchronized non-destructively.');
      }

      // CRITICAL: Production startup NEVER automatically runs seed or wipes database!
      if (process.env.AUTO_SEED === 'true') {
        console.warn('⚠️ [SECURITY] AUTO_SEED ignored in production to prevent data loss or database tampering.');
      }
    } else {
      console.log('[Runtime] Development mode. Synchronizing schema...');
      execSync('npx prisma db push --skip-generate', { stdio: 'inherit' });

      // Dev-only manual seeding flag
      if (process.env.DEV_SEED === 'true' && process.env.NODE_ENV !== 'production') {
        console.log('[Runtime] Running development seed...');
        execSync('npx ts-node prisma/seed.ts', { stdio: 'inherit' });
        console.log('[Runtime] Development seed finished.');
      }
    }
  } catch (dbErr) {
    console.warn('[Runtime] Warning during database migration/sync:', dbErr.message);
  }
} else {
  console.log('[Runtime] No DATABASE_URL specified. Running with local SQLite default.');
}

console.log('[Runtime] Launching NestJS Application Server...');

// Find main.js entry point
const candidatePaths = [
  path.resolve(__dirname, '..', 'dist', 'src', 'main.js'),
  path.resolve(__dirname, '..', 'dist', 'main.js'),
];

let entryFound = false;
for (const entryPath of candidatePaths) {
  if (fs.existsSync(entryPath)) {
    console.log(`[Runtime] Executing entry point: ${entryPath}`);
    require(entryPath);
    entryFound = true;
    break;
  }
}

if (!entryFound) {
  console.error('[Runtime] Error: Could not locate built main.js in dist/ or dist/src/!');
  process.exit(1);
}
