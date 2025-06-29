import {
  ForbiddenException,
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateIncidentDto } from './dto/create-incident.dto';
import { UpdateIncidentDto } from './dto/update-incident.dto';
import { IncidentStatus as PrismaIncidentStatus } from '@prisma/client';

@Injectable()
export class IncidentsService {
  constructor(private prisma: PrismaService) {}

  async createIncident(dto: CreateIncidentDto, userId: number) {
    const { title, description } = dto;
    const roomId = Number(dto.roomId);
    if (isNaN(roomId)) throw new BadRequestException('roomId không hợp lệ!');

    const room = await this.prisma.room.findUnique({ where: { roomId } });
    if (!room) throw new NotFoundException('Phòng không tồn tại!');

    return this.prisma.incident.create({
      data: {
        title,
        description,
        roomId,
        status: 'pending',
        userId,
        incidentTypeId: Number(dto.incidentTypeId),
        handledById: null,
        imageUrls: dto.imageUrls || [],
      },
    });
  }

  async getIncidentById(incidentId: number) {
    return this.prisma.incident.findUnique({
      where: { incidentId },
      include: {
        user: true,
        room: true,
        incidentType: true,
        handledBy: true,
        staffRating: true,
      },
    });
  }

  async updateIncident(id: number, dto: UpdateIncidentDto) {
    const incident = await this.prisma.incident.findUnique({
      where: { incidentId: id },
    });
    if (!incident) throw new NotFoundException('Incident not found');
    return this.prisma.incident.update({
      where: { incidentId: id },
      data: dto,
    });
  }

  async deleteIncident(id: number) {
    const incident = await this.prisma.incident.findUnique({
      where: { incidentId: id },
    });
    if (!incident) throw new NotFoundException('Incident not found');
    await this.prisma.staffRating.deleteMany({ where: { incidentId: id } });

    return this.prisma.incident.delete({ where: { incidentId: id } });
  }

  async getIncidentByIdForUser(incidentId: number, userId: number) {
    const incident = await this.prisma.incident.findUnique({
      where: { incidentId },
      include: {
        user: true,
        room: true,
        incidentType: true,
        handledBy: true,
        staffRating: true,
      },
    });
    if (!incident) throw new NotFoundException('Không tìm thấy sự cố');
    if (incident.userId !== userId)
      throw new ForbiddenException('Không có quyền truy cập!');
    return incident;
  }

  async updateIncidentStatus(
    id: number,
    status: PrismaIncidentStatus,
    staffUserId: number,
  ) {
    const incident = await this.prisma.incident.findUnique({
      where: { incidentId: id },
    });
    if (!incident) throw new NotFoundException('Sự cố không tồn tại');

    const data: any = { status };
    if (!incident.handledById) {
      data.handledById = staffUserId;
    }

    return this.prisma.incident.update({
      where: { incidentId: id },
      data,
    });
  }

  async filter(query: any, currentUser: any) {
    const { sortField = 'createdAt', sortOrder = 'desc' } = query;
    const ALLOWED_SORT_FIELDS = ['status', 'createdAt'];
    const sortKey = ALLOWED_SORT_FIELDS.includes(sortField)
      ? sortField
      : 'createdAt';
    const sortValue = sortOrder === 'asc' ? 'asc' : 'desc';

    const { incidentId, status, userId, from, to, search, skip, take } = query;
    const where: any = { AND: [] };

    if (incidentId) where.AND.push({ incidentId: +incidentId });
    if (status) where.AND.push({ status });
    if (userId) where.AND.push({ userId: +userId });

    if (from || to) {
      const createdAt: any = {};
      if (from) createdAt.gte = new Date(from);
      if (to) createdAt.lte = new Date(to);
      where.AND.push({ createdAt });
    }

    if (search) {
      const matchedUsers = await this.prisma.user.findMany({
        where: {
          username: { contains: search, mode: 'insensitive' },
        },
        select: { userId: true },
      });

      const matchedUserIds = matchedUsers.map((u) => u.userId);

      where.AND.push({
        OR: [
          { title: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
          ...(matchedUserIds.length > 0
            ? [{ userId: { in: matchedUserIds } }]
            : []),
        ],
      });
    }

    if (currentUser.role === 'USER') {
      where.AND.push({ userId: currentUser.userId });
    }

    const skipValue = parseInt(skip) || 0;
    const takeValue = parseInt(take) || 10;

    const incidents = await this.prisma.incident.findMany({
      where,
      include: {
        room: true,
        user: true,
        incidentType: true,
        handledBy: true, // Lấy cả nhân viên xử lý!
        staffRating: true, // Lấy cả đánh giá nếu có
      },
      skip: skipValue,
      take: takeValue,
      orderBy: { [sortKey]: sortValue },
    });

    const total = await this.prisma.incident.count({ where });

    return {
      data: incidents,
      total,
      page: {
        skip: skipValue,
        take: takeValue,
      },
    };
  }
}
