import { Controller, Get, Req, Res, UseGuards } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import type { Request, Response } from 'express';
import { GoogleAuthGuard } from './guards/google-auth.guard';
import { AuthService } from './auth.service';
import { UserService } from '../user/user.service';
import { GoogleProfile } from './strategies/google.strategy';

@ApiTags('auth')
@Controller('api/auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Google OAuth 로그인 시작
   * 사용자를 Google 로그인 페이지로 리다이렉트
   */
  @Get('google')
  @UseGuards(GoogleAuthGuard)
  @ApiOperation({ summary: 'Google OAuth 로그인 시작' })
  @ApiResponse({
    status: 302,
    description: 'Google 로그인 페이지로 리다이렉트',
  })
  googleAuth(): void {
    // Guard가 Google로 리다이렉트 처리
  }

  /**
   * Google OAuth 콜백
   * Google에서 인증 후 리다이렉트되는 엔드포인트
   */
  @Get('google/callback')
  @UseGuards(GoogleAuthGuard)
  @ApiOperation({ summary: 'Google OAuth 콜백' })
  async googleCallback(
    @Req() req: Request,
    @Res() res: Response,
  ): Promise<void> {
    const googleProfile = req.user as GoogleProfile;
    const frontendUrl = this.configService.getOrThrow<string>('FRONTEND_URL');

    try {
      // Find or create user
      const user = await this.userService.findOrCreateGoogleUser(googleProfile);

      // Generate JWT token using existing AuthService
      const accessToken = await this.authService.generateAccessToken(user);

      // Redirect to frontend with token
      res.redirect(`${frontendUrl}/auth/callback?token=${accessToken}`);
    } catch {
      res.redirect(`${frontendUrl}/login?error=oauth_failed`);
    }
  }
}
