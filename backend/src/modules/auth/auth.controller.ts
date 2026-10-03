import { Controller, Post, Get, Patch, Body, UseGuards, Req } from '@nestjs/common';
import { Request } from 'express';
import { AuthService } from './auth.service';
import { LoginDto, RegisterDto, UpdateProfileDto, GoogleAuthDto } from './dto/auth.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post('login')
  async login(@Body() dto: LoginDto, @Req() req: Request) {
    const ip = req.ip || (req.headers['x-forwarded-for'] as string);
    const userAgent = req.headers['user-agent'] as string;
    return this.authService.login(dto, ip, userAgent);
  }

  @Post('google')
  async googleLogin(@Body() dto: GoogleAuthDto, @Req() req: Request) {
    const ip = req.ip || (req.headers['x-forwarded-for'] as string);
    const userAgent = req.headers['user-agent'] as string;
    return this.authService.googleLogin(dto, ip, userAgent);
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  async logout(@CurrentUser('id') userId: string, @Req() req: Request) {
    const ip = req.ip || (req.headers['x-forwarded-for'] as string);
    const userAgent = req.headers['user-agent'] as string;
    return this.authService.logout(userId, ip, userAgent);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getMe(@CurrentUser('id') userId: string) {
    return this.authService.getMe(userId);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('profile')
  async updateProfile(@CurrentUser('id') userId: string, @Body() dto: UpdateProfileDto) {
    return this.authService.updateProfile(userId, dto);
  }
}

