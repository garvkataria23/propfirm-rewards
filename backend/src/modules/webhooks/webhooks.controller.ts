import { Controller, Post, Get, Param, Body, Query, Headers, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { WebhooksService, AffiliateWebhookPayload } from './webhooks.service';

@ApiTags('Affiliate Webhooks')
@Controller('webhooks/affiliate')
export class WebhooksController {
  constructor(private readonly webhooksService: WebhooksService) {}

  @Post(':slug')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'HMAC-authenticated POST postback webhook for prop firm affiliate conversions' })
  async handlePostbackPost(
    @Param('slug') slug: string,
    @Body() body: AffiliateWebhookPayload,
    @Query() query: AffiliateWebhookPayload,
    @Headers('x-signature') sigHeader?: string,
    @Headers('x-webhook-signature') altSigHeader?: string,
    @Headers('x-webhook-timestamp') timestampHeader?: string,
  ) {
    const combinedPayload = { ...query, ...body };
    const signature = sigHeader || altSigHeader || combinedPayload.signature;
    const timestamp = timestampHeader || combinedPayload.timestamp;

    return this.webhooksService.handleAffiliatePostback(slug, combinedPayload, {
      signature,
      timestamp,
    });
  }

  @Get(':slug')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'HMAC-authenticated GET postback webhook for prop firm affiliate conversions' })
  async handlePostbackGet(
    @Param('slug') slug: string,
    @Query() query: AffiliateWebhookPayload,
    @Headers('x-signature') sigHeader?: string,
    @Headers('x-webhook-signature') altSigHeader?: string,
    @Headers('x-webhook-timestamp') timestampHeader?: string,
  ) {
    const signature = sigHeader || altSigHeader || query.signature;
    const timestamp = timestampHeader || query.timestamp;

    return this.webhooksService.handleAffiliatePostback(slug, query, {
      signature,
      timestamp,
    });
  }
}
