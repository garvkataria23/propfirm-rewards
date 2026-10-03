import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger, BadRequestException } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import * as express from 'express';
import * as path from 'path';
import * as fs from 'fs';
import { AppModule } from './app.module';

// Simple, high-efficiency in-memory rate limiter for DDoS and brute-force protection
interface RateLimitRecord {
  count: number;
  resetAt: number;
}
const rateLimitMap = new Map<string, RateLimitRecord>();

// Clean up expired rate limit entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, record] of rateLimitMap.entries()) {
    if (now > record.resetAt) {
      rateLimitMap.delete(key);
    }
  }
}, 5 * 60 * 1000);

function rateLimiterMiddleware(maxRequests: number, windowMs: number) {
  return (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const ip = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';
    const key = `${ip}:${req.path}`;
    const now = Date.now();

    const record = rateLimitMap.get(key as string);
    if (!record || now > record.resetAt) {
      rateLimitMap.set(key as string, { count: 1, resetAt: now + windowMs });
      return next();
    }

    record.count++;
    if (record.count > maxRequests) {
      res.setHeader('Retry-After', Math.ceil((record.resetAt - now) / 1000));
      return res.status(429).json({
        statusCode: 429,
        error: 'Too Many Requests',
        message: 'Security rate limit exceeded. Please wait a moment before trying again.',
      });
    }

    next();
  };
}

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);

  // Security Headers Middleware (Zero-dependency Helmet Equivalent)
  app.use((req: express.Request, res: express.Response, next: express.NextFunction) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.removeHeader('X-Powered-By');
    next();
  });

  // Body parser limits to prevent memory exhaustion attacks
  app.use(express.json({ limit: '5mb' }));
  app.use(express.urlencoded({ limit: '5mb', extended: true }));

  // Apply rate limiter on sensitive endpoints (brute-force defense)
  app.use('/auth/login', rateLimiterMiddleware(10, 60 * 1000)); // max 10 login attempts / min
  app.use('/auth/register', rateLimiterMiddleware(5, 60 * 1000)); // max 5 registrations / min
  app.use('/auth/google', rateLimiterMiddleware(10, 60 * 1000)); // max 10 google auth / min
  app.use('/redemptions', rateLimiterMiddleware(15, 60 * 1000)); // max 15 redemption calls / min
  app.use('/webhooks', rateLimiterMiddleware(60, 60 * 1000)); // max 60 webhook events / min

  // Enable CORS with secure origin checks
  app.enableCors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, or server-to-server)
      if (!origin) return callback(null, true);

      const isProd = process.env.NODE_ENV === 'production';
      const configured = process.env.CORS_ORIGIN || '';
      const allowedSet = new Set(
        configured
          .split(',')
          .map((o) => o.trim())
          .filter(Boolean),
      );

      // In development only, allow standard local dev origins
      if (!isProd) {
        allowedSet.add('http://localhost:3000');
        allowedSet.add('http://127.0.0.1:3000');
        allowedSet.add('http://localhost:3001');
      }

      if (allowedSet.has(origin)) {
        return callback(null, true);
      }

      // Reject all unauthorized origins
      return callback(new Error(`Origin ${origin} not allowed by CORS security policy`));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'X-Signature', 'X-Webhook-Signature', 'X-Webhook-Timestamp'],
  });

  // Global validation pipe with whitelist stripping
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: false,
    }),
  );

  // Serve static files from /uploads
  const uploadDir = path.resolve(process.cwd(), 'uploads');
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }
  // Serve static files from /uploads with strict download & execution prevention headers
  app.use(
    '/uploads',
    (req: express.Request, res: express.Response, next: express.NextFunction) => {
      res.setHeader('Content-Disposition', 'attachment');
      res.setHeader('X-Content-Type-Options', 'nosniff');
      res.setHeader('Content-Security-Policy', "default-src 'none'");
      res.setHeader('Cache-Control', 'private, max-age=3600');
      next();
    },
    express.static(uploadDir),
  );

  const port = process.env.PORT || 4000;
  const isProd = process.env.NODE_ENV === 'production';
  const enableSwagger = process.env.ENABLE_SWAGGER === 'true' || !isProd;

  // Swagger OpenAPI Documentation (gated in production)
  if (enableSwagger) {
    const config = new DocumentBuilder()
      .setTitle('PropFirm Affiliate Rewards API')
      .setDescription(
        'Complete production-ready backend API for PropFirm referral tracking, purchase verification, points ledger, and reward redemptions.',
      )
      .setVersion('1.0')
      .addBearerAuth()
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document);
    logger.log(`📚 Swagger API Docs available at http://localhost:${port}/api/docs`);
  } else {
    logger.log('🔒 Swagger API Docs disabled in production environment for security hardening');
  }

  await app.listen(port, '0.0.0.0');
  logger.log(`🚀 PropFirm Rewards Backend running on http://0.0.0.0:${port}`);
}

bootstrap();
