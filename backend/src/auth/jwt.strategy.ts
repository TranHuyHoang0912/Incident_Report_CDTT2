import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(), // Lấy token từ header Bearer
      ignoreExpiration: false, //ko bỏ qua hạn token
      secretOrKey: process.env.JWT_SECRET || 'mysecretkey', // Secret để verify token
    });
  }
  async validate(payload: any) {
    // console.log('JWT payload nhận được:', payload);
    // Khi xác thực thành công, trả về object gắn vào req.user cho route sử dụng
    return {
      userId: payload.sub,
      username: payload.username,
      role: payload.role,
    };
  }
}
