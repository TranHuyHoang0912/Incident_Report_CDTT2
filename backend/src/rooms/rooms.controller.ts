import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Body,
  Param,
  ForbiddenException,
  Req,
} from '@nestjs/common';
import { RoomsService } from './rooms.service';
import { CreateRoomDto } from './dto/create-room.dto';
import { UpdateRoomDto } from './dto/update-room.dto';
import { AdminGuard } from 'src/auth/role.guard';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { Query } from '@nestjs/common';

@UseGuards(JwtAuthGuard)
@Controller('rooms')
export class RoomsController {
  constructor(private readonly roomsService: RoomsService) {}

  // @UseGuards(AdminGuard)
  @Get()
  findFiltered(@Query() query: any) {
    return this.roomsService.filter(query);
  }

  @Post()
  @UseGuards(AdminGuard)
  async createRoom(@Body() createRoomDto: CreateRoomDto, @Req() req) {
    const userRole = req.user.role;
    if (userRole !== 'ADMIN') {
      throw new ForbiddenException('Bạn không có quyền tạo phòng này');
    }

    return this.roomsService.create(createRoomDto);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.roomsService.findOne(Number(id));
  }

  @UseGuards(AdminGuard)
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateRoomDto) {
    return this.roomsService.update(Number(id), dto);
  }

  @UseGuards(AdminGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.roomsService.remove(Number(id));
  }
}
