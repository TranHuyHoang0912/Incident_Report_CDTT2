import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateStaffRatingDto } from './dto/create-staff-rating.dto';

@Injectable()
export class StaffRatingService {
  constructor(private prisma: PrismaService) {}

  // Tạo đánh giá
  async create(dto: CreateStaffRatingDto, userId: number) {
    const incident = await this.prisma.incident.findUnique({
      where: { incidentId: dto.incidentId },
    });

    if (!incident) throw new NotFoundException('Sự cố không tồn tại!');

    if (incident.status !== 'resolved') {
      throw new BadRequestException('Chỉ đánh giá khi sự cố đã xử lý xong!');
    }

    if (incident.userId !== userId) {
      throw new ForbiddenException('Bạn không có quyền đánh giá sự cố này!');
    }

    if (incident.handledById === null) {
      throw new BadRequestException('Không có nhân viên xử lý sự cố này!');
    }

    // Kiểm tra xem sự cố này đã được đánh giá chưa
    const existingRating = await this.prisma.staffRating.findUnique({
      where: { incidentId: dto.incidentId },
    });

    if (existingRating) {
      throw new BadRequestException('Bạn đã đánh giá sự cố này rồi!');
    }

    // Tạo đánh giá cho sự cố
    const rating = await this.prisma.staffRating.create({
      data: {
        incidentId: dto.incidentId,
        userId, // Người đánh giá là user
        rating: dto.rating,
        comment: dto.comment,
        staffId: incident.handledById, // staff là người xử lý sự cố
      },
    });

    return rating;
  }

  // Lấy tất cả đánh giá của user (user hoặc staff)
  async findAll(query: any, userId: number) {
    const { take, skip } = query;

    const ratings = await this.prisma.staffRating.findMany({
      where: {
        OR: [
          { userId }, // Lọc theo userId, để user có thể xem đánh giá của mình
          { staffId: userId }, // Hoặc để staff có thể xem các đánh giá của mình
        ],
      },
      include: {
        incident: true, // Lấy thông tin sự cố liên quan
        staff: true, // Lấy thông tin nhân viên xử lý
      },
      take: parseInt(take), // Giới hạn số lượng kết quả trả về
      skip: parseInt(skip), // Giới hạn từ đâu bắt đầu
      orderBy: { createdAt: 'desc' }, // Sắp xếp theo thời gian tạo mới nhất
    });

    return ratings;
  }
}
