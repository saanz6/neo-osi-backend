// src/auth/jwt.strategy.ts

import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private configService: ConfigService) {
    const secret = configService.get<string>('JWT_SECRET') || process.env.JWT_SECRET;
    
    // Отладочная информация
    console.log('JWT_SECRET from ConfigService:', configService.get<string>('JWT_SECRET'));
    console.log('JWT_SECRET from process.env:', process.env.JWT_SECRET);
    console.log('Final secret:', secret);

    if (!secret) {
      throw new Error('JWT_SECRET не найден в .env файле! Приложение не может быть запущено.');
    }

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: secret,
    });
  }
  async validate(payload: any) {
    // Мы возвращаем объект с полем `userId`
    return { userId: payload.sub, email: payload.email, tariff: payload.tariff };
  }
}
