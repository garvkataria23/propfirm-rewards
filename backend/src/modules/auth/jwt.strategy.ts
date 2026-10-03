import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from '../../prisma/prisma.service';
import { getJwtSecret } from '../../common/config/jwt.config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  private userCache = new Map<string, { user: any; expiresAt: number }>();
  private readonly CACHE_TTL_MS = 30_000; // 30 seconds cache for burst parallel requests

  constructor(private prisma: PrismaService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: getJwtSecret(),
    });
  }

  async validate(payload: { sub: string; email: string; role: string; tokenVersion?: number }) {
    const now = Date.now();
    const cached = this.userCache.get(payload.sub);
    let user = cached && cached.expiresAt > now ? cached.user : null;

    if (!user) {
      user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          status: true,
          phone: true,
          country: true,
          avatarUrl: true,
          tokenVersion: true,
        },
      });
      if (user) {
        this.userCache.set(payload.sub, { user, expiresAt: now + this.CACHE_TTL_MS });
      }
    }

    if (!user) {
      throw new UnauthorizedException('User account no longer exists');
    }

    if (user.status === 'SUSPENDED') {
      throw new UnauthorizedException('Account suspended');
    }

    if (payload.tokenVersion !== undefined && user.tokenVersion !== payload.tokenVersion) {
      this.userCache.delete(payload.sub);
      throw new UnauthorizedException('Session has been revoked or invalidated. Please log in again.');
    }

    return user;
  }
}
