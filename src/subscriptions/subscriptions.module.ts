// src\subscriptions\subscriptions.module.ts

import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { SubscriptionsController } from './subscriptions.controller';
import { SubscriptionsService } from './subscriptions.service';
import { UsersModule } from '../users/users.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    HttpModule, // Важно импортировать для совершения HTTP-запросов
    UsersModule, // Нам нужен доступ к UsersService
    AuthModule,
  ],
  controllers: [SubscriptionsController],
  providers: [SubscriptionsService],
})
export class SubscriptionsModule {}