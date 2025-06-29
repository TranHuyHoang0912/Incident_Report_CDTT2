import { Module } from '@nestjs/common';
import { IncidentsService } from './incidents.service';
import { IncidentsController } from './incidents.controller';
import { PrismaModule } from '../../prisma/prisma.module'; // import đúng path
import { AuthModule } from '../auth/auth.module';
import { forwardRef } from '@nestjs/common';

@Module({
  imports: [PrismaModule, forwardRef(() => AuthModule)], // <-- Thêm dòng này
  controllers: [IncidentsController],
  providers: [IncidentsService],
})
export class IncidentsModule {}
