import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Req,
  ForbiddenException,
  NotFoundException,
  UseGuards,
  UseInterceptors,
  UploadedFiles,
  Query,
} from '@nestjs/common';
import { IncidentsService } from './incidents.service';
import { CreateIncidentDto } from './dto/create-incident.dto';
import { UpdateIncidentDto } from './dto/update-incident.dto';
import { UpdateIncidentStatusDto } from './dto/update-incident-status.dto';
import { FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { IncidentStatus as PrismaIncidentStatus } from '@prisma/client';

@Controller('incidents')
@UseGuards(JwtAuthGuard)
export class IncidentsController {
  constructor(private readonly incidentsService: IncidentsService) {}

  @Post()
  @UseInterceptors(
    FilesInterceptor('files', 3, {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, cb) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() + 1e9);
          cb(null, uniqueSuffix + extname(file.originalname));
        },
      }),
      limits: { files: 3 },
    }),
  )
  async create(
    @Body() dto: CreateIncidentDto,
    @Req() req,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    const imageUrls = files ? files.map((f) => `/uploads/${f.filename}`) : [];
    return this.incidentsService.createIncident(
      { ...dto, imageUrls },
      req.user.userId,
    );
  }

  @Get()
  async findFiltered(@Query() query, @Req() req) {
    return this.incidentsService.filter(query, req.user);
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Req() req) {
    const { userId, role } = req.user;
    if (role === 'ADMIN' || role === 'STAFF') {
      return this.incidentsService.getIncidentById(Number(id));
    } else {
      return this.incidentsService.getIncidentByIdForUser(Number(id), userId);
    }
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateIncidentDto,
    @Req() req,
  ) {
    if ('status' in dto) {
      throw new ForbiddenException('Không được update status ở endpoint này!');
    }
    return this.incidentsService.updateIncident(Number(id), dto);
  }

  @Patch('update-status/:id')
  async updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateIncidentStatusDto,
    @Req() req,
  ) {
    const enumStatus = dto.status as PrismaIncidentStatus;
    return this.incidentsService.updateIncidentStatus(
      Number(id),
      enumStatus,
      req.user.userId, // userId của staff thực hiện
    );
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @Req() req) {
    const { role, userId } = req.user;
    const incident = await this.incidentsService.getIncidentById(Number(id));
    if (!incident) throw new NotFoundException('Incident not found');

    if (role === 'ADMIN') {
      return this.incidentsService.deleteIncident(Number(id));
    }
    if (role === 'USER') {
      if (incident.userId !== userId)
        throw new ForbiddenException('Không phải sự cố của bạn!');
      if (incident.status !== 'pending')
        throw new ForbiddenException(
          'Bạn chỉ có thể xóa sự cố khi chưa được xử lý!',
        );
      return this.incidentsService.deleteIncident(Number(id));
    }
    if (role === 'STAFF') {
      throw new ForbiddenException('Staff không có quyền xoá!');
    }
  }
}
