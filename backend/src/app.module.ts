import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { IncidentsModule } from './incidents/incidents.module';
import { RoomsModule } from './rooms/rooms.module';
import { IncidentTypesModule } from './incident-types/incident-types.module';
import { StaffRatingModule } from './staff-rating/staff-rating.module';

@Module({
  imports: [
    PrismaModule,
    UserModule,
    AuthModule,
    IncidentsModule,
    RoomsModule,
    IncidentTypesModule,
    StaffRatingModule,
  ],
})
export class AppModule {}
