import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateRoomDto } from './dto/create-room.dto';
import { UpdateRoomDto } from './dto/update-room.dto';

@Injectable()
export class RoomsService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateRoomDto) {
    return this.prisma.room.create({ data: dto });
  }

  // async findAll() {
  //   return this.prisma.room.findMany();
  // }

  async findOne(id: number) {
    const room = await this.prisma.room.findUnique({ where: { roomId: id } });
    if (!room) throw new NotFoundException('Room not found');
    return room;
  }

  async update(id: number, dto: UpdateRoomDto) {
    await this.findOne(id); // kiểm tra tồn tại
    return this.prisma.room.update({
      where: { roomId: id },
      data: dto,
    });
  }

  async remove(id: number) {
    // Kiểm tra sự cố có liên quan đến phòng
    const incidents = await this.prisma.incident.findMany({
      where: {
        roomId: id, // Tìm các sự cố liên quan đến phòng
      },
    });

    if (incidents.length > 0) {
      // Nếu còn sự cố, trả về lỗi cho frontend
      throw new ForbiddenException(
        'Phòng này vẫn còn sự cố, không thể xóa được.',
      );
    }

    // Xóa phòng nếu không có sự cố
    return this.prisma.room.delete({
      where: {
        roomId: id,
      },
    });
  }

  async filter(query: any) {
    const { search, skip, take, order = 'asc', sortBy = 'name' } = query;
    const where: any = search
      ? {
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { description: { contains: search, mode: 'insensitive' } },
          ],
        }
      : {};

    const total = await this.prisma.room.count({ where });
    const data = await this.prisma.room.findMany({
      where,
      orderBy: { [sortBy]: order === 'desc' ? 'desc' : 'asc' },
      skip: skip ? Number(skip) : 0,
      take: take ? Number(take) : 10,
    });
    return { data, total };
  }
}
