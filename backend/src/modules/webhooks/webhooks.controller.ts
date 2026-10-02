import { Controller, Post, Get, Param, Body, Query, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { WebhooksService, AffiliateWebhookPayload } from './webhooks.service';

@ApiTags('Affiliate Webhooks')
@Controller('webhooks/affiliate')
export class WebhooksController {
  constructor(private readonly webhooksService: WebhooksService) {}

  @Post(':slug')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Universal POST postback webhook for prop firm affiliate conversions' })
  async handlePostbackPost(
    @Param('slug') slug: string,
    @Body() body: AffiliateWebhookPayload,
    @Query() query: AffiliateWebhookPayload,
  ) {
    const combinedPayload = { ...query, ...body };
    return this.webhooksService.handleAffiliatePostback(slug, combinedPayload);
  }

  @Get(':slug')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Universal GET postback webhook for prop firm affiliate conversions' })
  async handlePostbackGet(
    @Param('slug') slug: string,
    @Query() query: AffiliateWebhookPayload,
  ) {
    return this.webhooksService.handleAffiliatePostback(slug, query);
  }
}
