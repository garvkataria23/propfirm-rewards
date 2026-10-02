import { Controller, Get, OnModuleInit, Logger, ServiceUnavailableException } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { PrismaService } from './prisma/prisma.service';

@ApiTags('Health')
@Controller()
export class AppController implements OnModuleInit {
  private readonly logger = new Logger('KeepAliveService');

  constructor(private readonly prisma: PrismaService) {}

  onModuleInit() {
    // Run an automated keep-alive database ping every 6 hours
    const SIX_HOURS_MS = 6 * 60 * 60 * 1000;
    setInterval(async () => {
      try {
        await this.prisma.$queryRaw`SELECT 1 as heartbeat`;
        this.logger.log('Automated database keep-alive heartbeat dispatched successfully.');
      } catch (err: any) {
        this.logger.warn(`Keep-alive heartbeat failed: ${err.message}`);
      }
    }, SIX_HOURS_MS);

    // Initial keepalive ping 10 seconds after start
    setTimeout(async () => {
      try {
        await this.prisma.$queryRaw`SELECT 1 as startup_heartbeat`;
        this.logger.log('Initial startup keep-alive check completed.');
      } catch (e: any) {
        this.logger.warn(`Startup keep-alive ping skipped: ${e.message}`);
      }
    }, 10000);
  }

  @Get('health')
  @ApiOperation({ summary: 'Health check endpoint with live database keepalive ping' })
  async healthCheck() {
    let dbStatus = 'disconnected';
    let latencyMs = 0;
    try {
      const start = Date.now();
      await this.prisma.$queryRaw`SELECT 1 as keepalive`;
      latencyMs = Date.now() - start;
      dbStatus = 'connected';
    } catch (err: any) {
      dbStatus = `error: ${err.message}`;
    }

    return {
      status: dbStatus === 'connected' ? 'ok' : 'degraded',
      service: 'propfirm-rewards-api',
      database: dbStatus,
      latencyMs,
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    };
  }

  @Get('health/live')
  @ApiOperation({ summary: 'Liveness probe (returns 200 if process is responsive)' })
  livenessProbe() {
    return {
      status: 'alive',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    };
  }

  @Get('health/ready')
  @ApiOperation({ summary: 'Readiness probe (verifies database connectivity)' })
  async readinessProbe() {
    const start = Date.now();
    try {
      await this.prisma.$queryRaw`SELECT 1 as readiness`;
      return {
        status: 'ready',
        database: 'connected',
        latencyMs: Date.now() - start,
        timestamp: new Date().toISOString(),
      };
    } catch (err: any) {
      throw new ServiceUnavailableException({
        status: 'not_ready',
        database: 'disconnected',
        error: err.message,
        timestamp: new Date().toISOString(),
      });
    }
  }

  @Get()
  @ApiOperation({ summary: 'API Root greeting' })
  root() {
    return {
      message: 'PropFirm Rewards (PropNation) API is running',
      docs: '/api/docs',
      health: '/health',
      live: '/health/live',
      ready: '/health/ready',
    };
  }
}
