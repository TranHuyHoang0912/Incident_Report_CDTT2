import { Module } from '@nestjs/common';
import { IncidentTypesController } from './incident-types.controller';
import { IncidentTypesService } from './incident-types.service';
import { PrismaModule } from '../../prisma/prisma.module';
import { forwardRef } from '@nestjs/common';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [PrismaModule, forwardRef(() => AuthModule)],
  controllers: [IncidentTypesController],
  providers: [IncidentTypesService],
})
export class IncidentTypesModule {}
