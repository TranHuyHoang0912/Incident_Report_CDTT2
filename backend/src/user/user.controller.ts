import {
  Controller,
  Post,
  Get,
  Delete,
  Body,
  UseGuards,
  Req,
  Patch,
  UsePipes,
  ValidationPipe,
  UnauthorizedException,
} from '@nestjs/common';
import { UserService } from './user.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateUserDto } from './dto/create-user.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { Query } from '@nestjs/common';
import { AdminGuard } from 'src/auth/role.guard';
import { Request } from '@nestjs/common';
import { Param } from '@nestjs/common';
import { ChangeRoleUserDto } from './dto/change-role-user.dto';

@UseGuards(JwtAuthGuard)
@Controller('users')
export class UserController {
  constructor(private userService: UserService) {} // Inject UserService để gọi hàm xử lý DB

  @UseGuards(AdminGuard)
  @Get()
  findFiltered(@Query() query: any, @Request() req) {
    return this.userService.filter(query, req.user);
  }
  @UseGuards(AdminGuard)
  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.userService.remove(Number(id));
  }
  @Patch('change-password')
  // @UseGuards(JwtAuthGuard)
  @UsePipes(new ValidationPipe({ whitelist: true })) // Tự động validate input cho đổi mật khẩu
  async changePassword(
    @Body() body: ChangePasswordDto, // Nhận dữ liệu body theo DTO đổi mật khẩu
    @Req() req, // Lấy thông tin user từ token (JWT)
  ) {
    console.log('=== REQUEST CHANGE PASSWORD ===');
    console.log('req.user:', req.user); // Xem payload giải mã từ token
    console.log('body:', body);
    return this.userService.changePassword(
      req.user.userId, // Lấy userId từ token, đảm bảo chỉ đổi của chính mình
      body.oldPassword, // Mật khẩu cũ truyền lên từ client
      body.newPassword,
    );
  }

  // @UseGuards(JwtAuthGuard)
  // @UseGuards(AdminGuard)
  @Post()
  @UsePipes(new ValidationPipe({ whitelist: true })) // Tự động validate input theo DTO, chỉ nhận field hợp lệ
  async createUser(
    @Body() body: CreateUserDto, // Nhận dữ liệu từ body, dùng kiểu DTO đã định nghĩa
    @Req() req, // Lấy request, để lấy thông tin user từ token
  ) {
    if (req.user.role !== 'ADMIN') {
      // Nếu user gọi API không phải ADMIN thì...
      throw new UnauthorizedException('Bạn không có quyền tạo tài khoản!'); // ...trả về lỗi 401
    }
    return this.userService.createUser(body); // Nếu là admin, gọi service để tạo user mới
  }

  @Patch(':id')
  @UseGuards(AdminGuard) // Nếu cần bảo vệ route
  update(@Param('id') id: string, @Body() dto: ChangeRoleUserDto) {
    return this.userService.update(Number(id), dto);
  }
}
