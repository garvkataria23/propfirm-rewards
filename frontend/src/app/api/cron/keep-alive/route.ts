import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://icqkfaurtrkqeqlcegvu.supabase.co';
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

  const results: Record<string, any> = {
    timestamp: new Date().toISOString(),
    cronTriggered: true,
  };

  // 1. Direct query to Supabase REST endpoint to keep PostgreSQL instance awake
  try {
    const start = Date.now();
    const res = await fetch(`${supabaseUrl}/rest/v1/PropFirm?select=count`, {
      method: 'GET',
      headers: {
        apikey: supabaseKey || '',
        Authorization: `Bearer ${supabaseKey || ''}`,
        Range: '0-0',
      },
      cache: 'no-store',
    });
    results.supabase = {
      status: res.status,
      latencyMs: Date.now() - start,
      active: true,
    };
  } catch (err: any) {
    results.supabase = {
      error: err.message,
      active: false,
    };
  }

  // 2. Direct ping to backend health endpoint
  try {
    const start = Date.now();
    const res = await fetch(`${backendUrl}/health`, {
      method: 'GET',
      cache: 'no-store',
    });
    results.backend = {
      status: res.status,
      latencyMs: Date.now() - start,
    };
  } catch (err: any) {
    results.backend = {
      note: 'Backend ping optional or offline',
      error: err.message,
    };
  }

  return NextResponse.json({
    status: 'ok',
    message: 'Automated 24/7 Supabase keep-alive cron job executed successfully',
    data: results,
  });
}
