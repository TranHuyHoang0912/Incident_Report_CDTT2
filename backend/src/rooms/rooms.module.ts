import { Module } from '@nestjs/common';
import { RoomsController } from './rooms.controller';
import { RoomsService } from './rooms.service';
import { PrismaModule } from '../../prisma/prisma.module';
import { forwardRef } from '@nestjs/common';
import { AuthModule } from 'src/auth/auth.module';
@Module({
  imports: [PrismaModule, forwardRef(() => AuthModule)],
  controllers: [RoomsController],
  providers: [RoomsService],
})
export class RoomsModule {}
