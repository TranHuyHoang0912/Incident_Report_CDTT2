import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateIncidentTypeDto } from './dto/create-incident-type.dto';
import { UpdateIncidentTypeDto } from './dto/update-incident-type.dto';

@Injectable()
export class IncidentTypesService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateIncidentTypeDto) {
    return this.prisma.incidentType.create({ data: dto });
  }

  async findAll() {
    return this.prisma.incidentType.findMany();
  }

  async findOne(id: number) {
    const type = await this.prisma.incidentType.findUnique({
      where: { incidentTypeId: id },
    });
    if (!type) throw new NotFoundException('Incident type not found');
    return type;
  }

  async update(id: number, dto: UpdateIncidentTypeDto) {
    await this.findOne(id); // kiểm tra tồn tại
    return this.prisma.incidentType.update({
      where: { incidentTypeId: id },
      data: dto,
    });
  }

  async remove(id: number) {
    await this.findOne(id); // kiểm tra tồn tại
    return this.prisma.incidentType.delete({ where: { incidentTypeId: id } });
  }
}
