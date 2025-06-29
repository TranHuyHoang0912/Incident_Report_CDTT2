import {
  Controller,
  Post,
  Body,
  UsePipes,
  ValidationPipe,
  Get,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from './jwt-auth.guard';
import { Req } from '@nestjs/common';
import { Patch, Param } from '@nestjs/common';
import { ForgotPasswordDto } from './dto/forgot-password.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async login(@Body() body: LoginDto) {
    return await this.authService.login(body.username, body.password);
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  async logout(@Req() req) {
    const userId = req.user.userId;
    return this.authService.logout(userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  getMe(@Req() req) {
    return {
      userId: req.user.userId,
      username: req.user.username,
      role: req.user.role,
    };
  }

  @Post('forgot-password')
  async forgotPassword(@Body() body: ForgotPasswordDto) {
    return this.authService.resetPasswordToken(body);
  }

  @Patch('reset-password/:token')
  async resetPassword(
    @Body() body: { newPassword: string },
    @Param('token') token: string,
  ) {
    return this.authService.resetPassword(token, body.newPassword);
  }
}
