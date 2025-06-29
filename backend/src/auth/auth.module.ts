import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './jwt.strategy';
import { UserModule } from '../user/user.module';
import { PrismaModule } from 'prisma/prisma.module';
import { forwardRef } from '@nestjs/common';

@Module({
  imports: [
    PrismaModule,
    forwardRef(() => UserModule),
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'mysecretkey',
      signOptions: { expiresIn: process.env.JWT_EXPIRES_IN || '1d' },
    }),
  ],
  providers: [AuthService, JwtStrategy],
  controllers: [AuthController],
  exports: [AuthService, JwtStrategy, JwtModule],
})
export class AuthModule {}
