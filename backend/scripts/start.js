const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('==================================================');
console.log('🚀 PropFirm Rewards Backend Starting...');
console.log('==================================================');

const dbUrl = process.env.DATABASE_URL || '';

if (dbUrl) {
  try {
    console.log('[Runtime] Applying database migrations via prisma db push...');
    execSync('npx prisma db push --skip-generate --accept-data-loss', { stdio: 'inherit' });
    console.log('[Runtime] Database schema synced successfully.');

    // Auto-seed if flag is on or if table is empty
    if (process.env.AUTO_SEED === 'true' || process.env.NODE_ENV === 'production') {
      try {
        console.log('[Runtime] Running initial database seed...');
        execSync('npx ts-node prisma/seed.ts', { stdio: 'inherit' });
        console.log('[Runtime] Database seed finished.');
      } catch (seedErr) {
        console.log('[Runtime] Seed notice (records may already exist):', seedErr.message);
      }
    }
  } catch (dbErr) {
    console.warn('[Runtime] Warning: Database push warning:', dbErr.message);
  }
} else {
  console.log('[Runtime] No DATABASE_URL specified. Running with local default.');
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
