import {
  Controller,
  Post,
  Body,
  Req,
  UseGuards,
  Get,
  Query,
} from '@nestjs/common';
import { StaffRatingService } from './staff-rating.service';
import { CreateStaffRatingDto } from './dto/create-staff-rating.dto';
import { AuthGuard } from '@nestjs/passport';

@UseGuards(AuthGuard('jwt'))
@Controller('staff-ratings')
export class StaffRatingController {
  constructor(private readonly staffRatingService: StaffRatingService) {}

  @Post()
  async create(@Body() dto: CreateStaffRatingDto, @Req() req) {
    return this.staffRatingService.create(dto, req.user.userId);
  }

  @Get()
  async findAll(@Query() query, @Req() req) {
    return this.staffRatingService.findAll(query, req.user.userId);
  }
}
