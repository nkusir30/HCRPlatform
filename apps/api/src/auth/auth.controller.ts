import { Controller, Post, Body, Req, Res, HttpCode } from '@nestjs/common';
import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { CommonService } from '../common/common.service';

export class LoginDto {
  email: string;
  password: string;
}

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly common: CommonService,
  ) {}

  @Post('login')
  async login(@Body() body: LoginDto, @Res({ passthrough: true }) res: Response) {
    const result = await this.authService.login(body.email, body.password);
    const { access_token } = result;

    // Set cookie
    res.cookie('auth_token', access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return { access_token, userId: this.common.validateId(result.user.sub) };
  }

  @Post('logout')
  @HttpCode(204)
  async logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie('auth_token');
    return;
  }

  @Post('me')
  async me(@Req() _req: Request) {
    // In a real app, this would validate the token
    // For now, return simulated user
    return {
      id: 'demo-user',
      email: 'demo@hrv-homes.com',
      name: 'Demo User',
      role: 'admin',
      orgId: 'demo-org',
      status: 'active',
    };
  }
}
