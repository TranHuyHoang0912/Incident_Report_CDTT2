import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import { PrismaService } from 'prisma/prisma.service';
import nodemailer from 'nodemailer';
import { ForgotPasswordDto } from './dto/forgot-password.dto'; // Thêm dòng này ở phần import

const nodemailer = require('nodemailer');

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
    private prisma: PrismaService,
  ) {}

  async login(username: string, password: string) {
    const user = await this.userService.validateUser(username, password);
    if (!user) {
      throw new UnauthorizedException('Sai tài khoản hoặc mật khẩu');
    }
    // Đóng gói thông tin cho token
    const payload = {
      sub: user.userId,
      username: user.username,
      role: user.role,
    };
    // Tạo JWT
    const token = this.jwtService.sign(payload);

    await this.prisma.user.update({
      where: { userId: user.userId },
      data: { currentToken: token },
    });

    return {
      access_token: token,
      user: {
        userId: user.userId,
        username: user.username,
        role: user.role,
      },
    };
  }

  async logout(userId: number) {
    await this.prisma.user.update({
      where: { userId },
      data: { currentToken: null },
    });
    return { message: 'Đăng xuất thành công' };
  }

  async resetPasswordToken(dto: ForgotPasswordDto) {
    const user = await this.prisma.user.findUnique({
      where: {
        email: dto.email,
      },
    });

    if (!user) {
      throw new BadRequestException('Email không tồn tại.');
    }

    const token = Math.random().toString(36).substring(2);

    // Gửi email reset mật khẩu
    await this.sendForgotPasswordEmail(dto.email, token, dto.username);

    // Lưu token vào cơ sở dữ liệu
    await this.prisma.forgotPassword.create({
      data: {
        email: dto.email,
        token,
      },
    });

    return 'Đã gửi email với hướng dẫn thay đổi mật khẩu.';
  }

  // Phương thức thay đổi mật khẩu khi nhận được token
  async resetPassword(token: string, newPassword: string) {
    const forgotPassword = await this.prisma.forgotPassword.findUnique({
      where: { token },
    });

    if (!forgotPassword) {
      throw new BadRequestException('Token không hợp lệ hoặc đã hết hạn.');
    }

    // Sử dụng mật khẩu plaintext trực tiếp
    await this.prisma.user.update({
      where: { email: forgotPassword.email },
      data: { password: newPassword }, // Lưu mật khẩu dưới dạng plaintext
    });

    await this.prisma.forgotPassword.delete({
      where: { token },
    });

    return 'Mật khẩu đã được thay đổi thành công.';
  }

  async sendForgotPasswordEmail(
    email: string,
    token: string,
    username: string,
  ) {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER, // Thay bằng email của bạn
        pass: process.env.GMAIL_PASS, // Thay bằng mật khẩu email của bạn
      },
    });

    const mailOptions = {
      from: process.env.GMAIL_USER,
      to: email,
      subject: 'Đặt lại mật khẩu của bạn',
      text: `Xin chào ${username}, hãy click vào đường dẫn sau đây để tiến hành đặt lại mật khẩu của bạn: http://localhost:3000/reset-password/${token}`,
    };

    await transporter.sendMail(mailOptions);
  }
}
