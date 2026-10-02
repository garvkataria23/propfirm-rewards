/**
 * PropFirm Rewards - 24/7 Automated Keep-Alive Daemon
 * Prevents Render 15-minute sleep and Supabase 7-day inactivity pause
 * Usage: node scripts/keepalive-daemon.js
 */

const https = require('https');
const http = require('http');

const FRONTEND_URL = process.env.FRONTEND_URL || 'https://frontend-eta-beryl-ezh34u4upe.vercel.app';
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:4000';
const INTERVAL_MS = 10 * 60 * 1000; // 10 minutes

function pingUrl(targetUrl) {
  return new Promise((resolve) => {
    const isHttps = targetUrl.startsWith('https');
    const client = isHttps ? https : http;
    const start = Date.now();

    const req = client.get(targetUrl, { timeout: 15000 }, (res) => {
      const latency = Date.now() - start;
      resolve({
        url: targetUrl,
        status: res.statusCode,
        latencyMs: latency,
        success: res.statusCode >= 200 && res.statusCode < 400,
      });
      res.resume();
    });

    req.on('error', (err) => {
      resolve({
        url: targetUrl,
        status: 0,
        error: err.message,
        success: false,
      });
    });

    req.on('timeout', () => {
      req.destroy();
      resolve({
        url: targetUrl,
        status: 408,
        error: 'Timeout (15s)',
        success: false,
      });
    });
  });
}

async function runKeepAliveCycle() {
  const timestamp = new Date().toISOString();
  console.log(`\n[${timestamp}] 🚀 Running 24/7 Keep-Alive Heartbeat Cycle...`);

  // 1. Ping Vercel Cron to query Supabase
  const cronRes = await pingUrl(`${FRONTEND_URL}/api/cron/keep-alive`);
  console.log(`  ⚡ Supabase / Vercel Cron: HTTP ${cronRes.status} (${cronRes.latencyMs || 0}ms)`);

  // 2. Ping Frontend Health
  const feRes = await pingUrl(`${FRONTEND_URL}/api/health`);
  console.log(`  🌐 Frontend Health:       HTTP ${feRes.status} (${feRes.latencyMs || 0}ms)`);

  // 3. Ping Backend Health
  const beRes = await pingUrl(`${BACKEND_URL}/health`);
  console.log(`  🛡️  Backend Health:        HTTP ${beRes.status} (${beRes.latencyMs || 0}ms)`);

  console.log(`✅ Heartbeat complete. Next ping scheduled in 10 minutes.`);
}

console.log('========================================================');
console.log('  PropFirm Rewards - 24/7 Zero-Inactivity Heartbeat Daemon');
console.log('  Interval: Every 10 Minutes');
console.log('========================================================');

// Initial run
runKeepAliveCycle();

// Recurring interval
setInterval(runKeepAliveCycle, INTERVAL_MS);
