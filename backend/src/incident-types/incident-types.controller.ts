import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Body,
  Param,
} from '@nestjs/common';
import { IncidentTypesService } from './incident-types.service';
import { CreateIncidentTypeDto } from './dto/create-incident-type.dto';
import { UpdateIncidentTypeDto } from './dto/update-incident-type.dto';
import { AdminGuard } from 'src/auth/role.guard';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('incident-types')
export class IncidentTypesController {
  constructor(private readonly incidentTypesService: IncidentTypesService) {}

  @UseGuards(AdminGuard)
  @Post()
  create(@Body() dto: CreateIncidentTypeDto) {
    return this.incidentTypesService.create(dto);
  }

  @Get()
  findAll() {
    return this.incidentTypesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.incidentTypesService.findOne(Number(id));
  }

  @UseGuards(AdminGuard)
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateIncidentTypeDto) {
    return this.incidentTypesService.update(Number(id), dto);
  }

  @UseGuards(AdminGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.incidentTypesService.remove(Number(id));
  }
}
