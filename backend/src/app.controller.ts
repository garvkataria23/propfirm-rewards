import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('Health')
@Controller()
export class AppController {
  @Get('health')
  @ApiOperation({ summary: 'Health check endpoint for Render/uptime monitors' })
  healthCheck() {
    return {
      status: 'ok',
      service: 'propfirm-rewards-api',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    };
  }

  @Get()
  @ApiOperation({ summary: 'API Root greeting' })
  root() {
    return {
      message: 'PropFirm Rewards (PropNation) API is running',
      docs: '/api/docs',
      health: '/health',
    };
  }
}
