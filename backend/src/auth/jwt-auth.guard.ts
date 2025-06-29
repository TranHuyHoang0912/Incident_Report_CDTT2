import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    // console.log('== JwtAuthGuard check ==');
    // LẤY TOKEN TỪ HEADER Authorization: Bearer ...
    const authHeader = req.headers['authorization'];
    const token =
      authHeader && authHeader.startsWith('Bearer ')
        ? authHeader.slice(7)
        : null;

    // console.log('Token trong header:', token);

    if (!token) {
      // console.log('Không có token trong header'); // LOG
      throw new UnauthorizedException('Không có token!');
    }

    let payload: any;
    try {
      payload = this.jwtService.verify(token);
    } catch (err) {
      // console.log('Token không hợp lệ:', err); // LOG
      throw new UnauthorizedException('Token không hợp lệ');
    }

    const user = await this.prisma.user.findUnique({
      where: { userId: payload.sub },
    });

    // console.log('User lấy từ DB:', user); // LOG
    // console.log('currentToken trong DB:', user?.currentToken); // LOG

    if (!user || user.currentToken !== token) {
      // console.log('Token KHÔNG TRÙNG hoặc không có user!'); // LOG
      throw new UnauthorizedException('Phiên đăng nhập không còn hợp lệ!');
    }

    req.user = {
      userId: user.userId,
      username: user.username,
      role: user.role,
    };

    return true;
  }
}
