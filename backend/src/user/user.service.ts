import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { constants } from 'buffer';
import { contains } from 'class-validator';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}
  // Tìm user theo username, trả về user nếu có, không có trả về null
  async findByUsername(username: string) {
    return this.prisma.user.findUnique({ where: { username } });
  }

  async createUser(data: {
    username: string;
    password: string;
    role: string;
    email?: string;
  }) {
    // Tạo user mới trong DB
    const existed = await this.findByUsername(data.username);
    if (existed) throw new BadRequestException('Username đã tồn tại!');
    return this.prisma.user.create({
      data: {
        username: data.username,
        password: data.password,
        email: data.email,
        role: data.role,
      },
      select: {
        userId: true,
        username: true,
        role: true,
        isActive: true,
      },
    });
  }

  async validateUser(username: string, password: string) {
    // Xác thực login: tìm user, so sánh password
    const user = await this.findByUsername(username);
    if (user && user.password === password) {
      return user;
    }
    return null;
  }

  async getUserById(userId: number) {
    // Lấy thông tin user qua userId, chỉ trả về trường an toàn
    const user = await this.prisma.user.findUnique({
      where: { userId },
      select: {
        userId: true,
        username: true,
        role: true,
        isActive: true,
      },
    });
    if (!user) throw new NotFoundException('User không tồn tại!');
    return user;
  }
  // đổi mật khẩu
  // async changePassword(
  //   userId: number,
  //   oldPassword: string,
  //   newPassword: string,
  // ) {
  //   const user = await this.prisma.user.findUnique({ where: { userId } });
  //   console.log('Đổi mật khẩu userId:', userId);
  //   if (!user) throw new NotFoundException('User không tồn tại!');
  //   console.log('Tìm thấy user:', user); // Xem user có tồn tại không
  //   if (user.password !== oldPassword)
  //     throw new BadRequestException('Mật khẩu cũ không đúng!');
  //   await this.prisma.user.update({
  //     where: { userId },
  //     data: { password: newPassword },
  //   });
  //   return { message: 'Đổi mật khẩu thành công!' };
  // }
  async changePassword(
    userId: number,
    oldPassword: string,
    newPassword: string,
  ) {
    const user = await this.prisma.user.findUnique({ where: { userId } });
    if (!user) throw new NotFoundException('User không tồn tại!');
    if (user.password !== oldPassword)
      throw new BadRequestException('Mật khẩu cũ không đúng!');

    // Đổi mật khẩu và xoá luôn currentToken
    await this.prisma.user.update({
      where: { userId },
      data: { password: newPassword, currentToken: null }, // Xoá token sau khi đổi mật khẩu!
    });
    return { message: 'Đổi mật khẩu thành công! Vui lòng đăng nhập lại.' };
  }
  //Hàm lọc và tìm kiếm
  async filter(query: any, currentUser: any) {
    //lấy các tham số truy vấn từ query trên URL
    const {
      role,
      isActive,
      search,
      skip,
      take,
      order = 'asc',
      sortBy = 'username',
    } = query;
    //xây dựng điều kiện cho Prisma
    const where: any = {};
    if (role) where.role = role;
    if (isActive !== undefined) where.isActive = isActive === 'true';
    if (search) {
      where.username = { contains: search, mode: 'insensitive' };
    }

    if (currentUser.role === 'USER') {
      where.userId = currentUser.userId;
    }

    const total = await this.prisma.user.count({ where });
    const data = await this.prisma.user.findMany({
      where,
      orderBy: { [sortBy]: order === 'desc' ? 'desc' : 'asc' },
      skip: skip ? Number(skip) : 0,
      take: take ? Number(take) : 10,
    });

    return { data, total };
  }

  async update(userId: number, dto: { role: string }) {
    return this.prisma.user.update({
      where: { userId: Number(userId) },
      data: dto,
      select: {
        userId: true,
        username: true,
        role: true,
        isActive: true,
      },
    });
  }

  async remove(userId: number) {
    // Xoá user theo userId
    return this.prisma.user.delete({
      where: { userId },
    });
  }
}
