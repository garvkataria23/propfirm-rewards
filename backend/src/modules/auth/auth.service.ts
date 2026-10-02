import { Injectable, BadRequestException, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { OAuth2Client } from 'google-auth-library';
import { PrismaService } from '../../prisma/prisma.service';
import { EmailService } from '../email/email.service';
import { LoginDto, RegisterDto, UpdateProfileDto, GoogleAuthDto } from './dto/auth.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private emailService: EmailService,
  ) {}

  async register(dto: RegisterDto) {
    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase().trim() },
    });

    if (existing) {
      throw new ConflictException('An account with this email address already exists');
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);
    const user = await this.prisma.user.create({
      data: {
        email: dto.email.toLowerCase().trim(),
        passwordHash,
        name: dto.name.trim(),
        phone: dto.phone || null,
        country: dto.country || null,
        role: 'USER',
        status: 'ACTIVE',
        emailVerified: true,
      },
    });

    // Create initial notification
    await this.prisma.notification.create({
      data: {
        userId: user.id,
        title: 'Welcome to PropFirm Rewards!',
        message: 'Your account is ready. Explore active prop-firm codes to earn points.',
        type: 'SYSTEM',
        linkUrl: '/prop-firms',
      },
    });

    // Send welcome email (async fire-and-forget or awaited)
    this.emailService.sendWelcomeEmail(user.email, user.name).catch(() => {});

    const token = this.generateToken(user);

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        status: user.status,
        country: user.country,
        avatarUrl: user.avatarUrl,
      },
    };
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase().trim() },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const isMatch = await bcrypt.compare(dto.password, user.passwordHash);
    if (!isMatch) {
      throw new UnauthorizedException('Invalid email or password');
    }

    if (user.status === 'SUSPENDED') {
      throw new UnauthorizedException('Your account has been suspended. Please contact support.');
    }

    const token = this.generateToken(user);

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        status: user.status,
        country: user.country,
        avatarUrl: user.avatarUrl,
      },
    };
  }

  private googleOAuthClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

  async googleLogin(dto: GoogleAuthDto) {
    const rawToken = dto.credential || dto.idToken;
    if (!rawToken || typeof rawToken !== 'string') {
      throw new BadRequestException('A valid Google ID token / credential is required');
    }

    let payload: any;
    try {
      const ticket = await this.googleOAuthClient.verifyIdToken({
        idToken: rawToken,
        audience: process.env.GOOGLE_CLIENT_ID || undefined,
      });
      payload = ticket.getPayload();
    } catch (err: any) {
      throw new UnauthorizedException(`Google ID token verification failed: ${err.message}`);
    }

    if (!payload || !payload.email) {
      throw new UnauthorizedException('Invalid Google token: missing email claim');
    }

    // Cryptographic claim validation
    const validIssuers = ['accounts.google.com', 'https://accounts.google.com'];
    if (!validIssuers.includes(payload.iss)) {
      throw new UnauthorizedException('Invalid Google token issuer');
    }

    if (payload.exp && payload.exp * 1000 < Date.now()) {
      throw new UnauthorizedException('Google ID token has expired');
    }

    if (!payload.email_verified) {
      throw new UnauthorizedException('Google account email has not been verified by Google');
    }

    const email = payload.email.toLowerCase().trim();
    const name = (payload.name || payload.given_name || email.split('@')[0]).trim();
    const avatarUrl = payload.picture || null;

    let user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (user) {
      if (user.status === 'SUSPENDED') {
        throw new UnauthorizedException('Your account has been suspended. Please contact support.');
      }
      if (avatarUrl && !user.avatarUrl) {
        user = await this.prisma.user.update({
          where: { id: user.id },
          data: { avatarUrl },
        });
      }
    } else {
      const randomPassword = await bcrypt.hash(`google_${Date.now()}_${Math.random()}`, 10);
      user = await this.prisma.user.create({
        data: {
          email,
          passwordHash: randomPassword,
          name,
          avatarUrl,
          role: 'USER', // SECURITY: ALWAYS default to USER. Never trust client or token claims for elevated roles!
          status: 'ACTIVE',
          emailVerified: true,
        },
      });

      await this.prisma.notification.create({
        data: {
          userId: user.id,
          title: 'Welcome to PropFirm Rewards!',
          message: 'Your Google-linked account is ready. Explore active prop-firm codes to earn points.',
          type: 'SYSTEM',
          linkUrl: '/prop-firms',
        },
      });

      this.emailService.sendWelcomeEmail(user.email, user.name).catch(() => {});
    }

    const token = this.generateToken(user);

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        status: user.status,
        country: user.country,
        avatarUrl: user.avatarUrl,
      },
    };
  }

  async getMe(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        country: true,
        role: true,
        status: true,
        avatarUrl: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    // Calculate balance and pending points
    const latestTx = await this.prisma.pointsLedger.findFirst({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      select: { balanceAfter: true },
    });

    const pendingSubmissions = await this.prisma.purchaseSubmission.findMany({
      where: {
        userId,
        status: { in: ['PENDING', 'UNDER_REVIEW'] },
      },
      select: { pointsAwarded: true },
    });

    const pendingPoints = pendingSubmissions.reduce((acc, curr) => acc + (curr.pointsAwarded || 0), 0);

    const activeRedemptionsCount = await this.prisma.redemption.count({
      where: {
        userId,
        status: { in: ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED'] },
      },
    });

    return {
      ...user,
      points: {
        available: latestTx ? latestTx.balanceAfter : 0,
        pending: pendingPoints,
      },
      activeRedemptionsCount,
    };
  }

  async updateProfile(userId: string, dto: UpdateProfileDto) {
    const updated = await this.prisma.user.update({
      where: { id: userId },
      data: {
        ...(dto.name && { name: dto.name.trim() }),
        ...(dto.phone !== undefined && { phone: dto.phone }),
        ...(dto.country !== undefined && { country: dto.country }),
        ...(dto.avatarUrl !== undefined && { avatarUrl: dto.avatarUrl }),
      },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        country: true,
        role: true,
        status: true,
        avatarUrl: true,
      },
    });

    return updated;
  }

  private generateToken(user: { id: string; email: string; role: string }) {
    return this.jwtService.sign({
      sub: user.id,
      email: user.email,
      role: user.role,
    });
  }
}
