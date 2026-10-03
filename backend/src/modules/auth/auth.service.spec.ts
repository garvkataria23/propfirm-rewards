import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { PrismaService } from '../../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { EmailService } from '../email/email.service';
import { BadRequestException, UnauthorizedException } from '@nestjs/common';

describe('AuthService (Google Token Cryptographic Verification & RBAC)', () => {
  let service: AuthService;
  let prisma: any;
  let jwtService: any;
  let emailService: any;

  beforeEach(async () => {
    prisma = {
      user: {
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
      notification: {
        create: jest.fn(),
      },
      auditLog: {
        create: jest.fn().mockResolvedValue({}),
      },
    };

    jwtService = {
      sign: jest.fn().mockReturnValue('mock-jwt-token'),
    };

    emailService = {
      sendWelcomeEmail: jest.fn().mockResolvedValue(undefined),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: prisma },
        { provide: JwtService, useValue: jwtService },
        { provide: EmailService, useValue: emailService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  describe('googleLogin', () => {
    it('should reject when no token or credential is provided', async () => {
      await expect(service.googleLogin({} as any)).rejects.toThrow(BadRequestException);
    });

    it('should reject if Google verifyIdToken throws (invalid signature, forged token, wrong audience)', async () => {
      // Mock OAuth2Client verifyIdToken failure
      (service as any).googleOAuthClient = {
        verifyIdToken: jest.fn().mockRejectedValue(new Error('Invalid token signature')),
      };

      await expect(
        service.googleLogin({ credential: 'forged.malicious.jwt' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should reject if Google token issuer is untrusted', async () => {
      (service as any).googleOAuthClient = {
        verifyIdToken: jest.fn().mockResolvedValue({
          getPayload: () => ({
            email: 'hacker@example.com',
            iss: 'https://evil-issuer.com',
            exp: Math.floor(Date.now() / 1000) + 3600,
            email_verified: true,
          }),
        }),
      };

      await expect(
        service.googleLogin({ credential: 'valid.token.bad.issuer' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should reject if Google token has expired', async () => {
      (service as any).googleOAuthClient = {
        verifyIdToken: jest.fn().mockResolvedValue({
          getPayload: () => ({
            email: 'trader@example.com',
            iss: 'https://accounts.google.com',
            exp: Math.floor(Date.now() / 1000) - 300, // expired 5 minutes ago
            email_verified: true,
          }),
        }),
      };

      await expect(
        service.googleLogin({ credential: 'expired.token' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should reject if email is not verified by Google', async () => {
      (service as any).googleOAuthClient = {
        verifyIdToken: jest.fn().mockResolvedValue({
          getPayload: () => ({
            email: 'unverified@example.com',
            iss: 'https://accounts.google.com',
            exp: Math.floor(Date.now() / 1000) + 3600,
            email_verified: false,
          }),
        }),
      };

      await expect(
        service.googleLogin({ credential: 'unverified.email.token' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should reject suspended users even with valid Google token', async () => {
      (service as any).googleOAuthClient = {
        verifyIdToken: jest.fn().mockResolvedValue({
          getPayload: () => ({
            email: 'banned@example.com',
            iss: 'https://accounts.google.com',
            exp: Math.floor(Date.now() / 1000) + 3600,
            email_verified: true,
          }),
        }),
      };

      prisma.user.findUnique.mockResolvedValue({
        id: 'user-banned',
        email: 'banned@example.com',
        status: 'SUSPENDED',
      });

      await expect(
        service.googleLogin({ credential: 'valid.token.suspended.user' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should securely create new user with immutable role USER (prevent role injection)', async () => {
      (service as any).googleOAuthClient = {
        verifyIdToken: jest.fn().mockResolvedValue({
          getPayload: () => ({
            email: 'newtrader@example.com',
            name: 'New Trader',
            iss: 'https://accounts.google.com',
            exp: Math.floor(Date.now() / 1000) + 3600,
            email_verified: true,
            picture: 'https://lh3.googleusercontent.com/avatar',
          }),
        }),
      };

      prisma.user.findUnique.mockResolvedValue(null);
      prisma.user.create.mockResolvedValue({
        id: 'user-new',
        email: 'newtrader@example.com',
        name: 'New Trader',
        role: 'USER',
        status: 'ACTIVE',
        avatarUrl: 'https://lh3.googleusercontent.com/avatar',
      });

      // Attempt role injection in payload (dto contains extra malicious properties)
      const maliciousDto: any = {
        credential: 'valid.google.id.token',
        role: 'SUPER_ADMIN',
        email: 'admin@propnation.com', // Attempting to spoof email
      };

      const result = await service.googleLogin(maliciousDto);

      // Verify user created with derived email from token, NOT dto.email
      expect(prisma.user.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            email: 'newtrader@example.com',
            role: 'USER', // strictly USER, ignoring SUPER_ADMIN injection attempt
          }),
        }),
      );
      expect(result.token).toBe('mock-jwt-token');
      expect(result.user.role).toBe('USER');
    });
  });
});
