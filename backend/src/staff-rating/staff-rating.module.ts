import { Module } from '@nestjs/common';
import { StaffRatingController } from './staff-rating.controller';
import { StaffRatingService } from './staff-rating.service';
import { PrismaModule } from '../../prisma/prisma.module';
@Module({
  imports: [PrismaModule],
  controllers: [StaffRatingController],
  providers: [StaffRatingService],
})
export class StaffRatingModule {}
