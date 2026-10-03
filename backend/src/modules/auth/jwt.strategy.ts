import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from '../../prisma/prisma.service';
import { getJwtSecret } from '../../common/config/jwt.config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private prisma: PrismaService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: getJwtSecret(),
    });
  }

  async validate(payload: { sub: string; email: string; role: string; tokenVersion?: number }) {
    const user = await this.prisma.user.findUnique({
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

    if (!user) {
      throw new UnauthorizedException('User account no longer exists');
    }

    if (user.status === 'SUSPENDED') {
      throw new UnauthorizedException('Account suspended');
    }

    if (payload.tokenVersion !== undefined && user.tokenVersion !== payload.tokenVersion) {
      throw new UnauthorizedException('Session has been revoked or invalidated. Please log in again.');
    }

    return user;
  }
}
