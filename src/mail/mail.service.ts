// src\mail\mail.service.ts

import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as formData from 'form-data';
import Mailgun from 'mailgun.js';

@Injectable()
export class MailService {
  private readonly mailgun: Mailgun;
  private readonly client;
  private readonly domain: string;
  private readonly fromEmail: string;
  private readonly backendUrl: string; // <-- Добавляем новое свойство


  constructor(private readonly configService: ConfigService) {
    // 1. Сначала получаем значения в локальные переменные
    const apiKey = this.configService.get<string>('MAILGUN_API_KEY');
    const domain = this.configService.get<string>('MAILGUN_DOMAIN');
    const fromEmail = this.configService.get<string>('MAILGUN_FROM_EMAIL');
    // Получаем URL бэкенда
    const backendUrl = this.configService.get<string>('BACKEND_URL');


    // 2. Проверяем их на существование
    if (!apiKey || !domain || !fromEmail || !backendUrl) {
      throw new Error('Ключевые переменные Mailgun или BACKEND_URL (.env) не определены!');
    }

    // 3. Только после успешной проверки присваиваем свойствам класса.
    // TypeScript теперь счастлив.
    this.domain = domain;
    this.fromEmail = fromEmail;
    this.backendUrl = backendUrl
    this.mailgun = new Mailgun(formData);
    this.client = this.mailgun.client({ username: 'api', key: apiKey });
  }

  /**
   * Отправляет письмо для сброса/установки пароля.
   * @param to - Email получателя.
   * @param token - Токен для сброса.
   */
  async sendPasswordResetEmail(to: string, token: string): Promise<void> {
    // --- ИСПРАВЛЕННАЯ ССЫЛКА ---
    // Теперь она ведет на наш новый GET-эндпоинт на бэкенде
    const resetLink = `${this.backendUrl}/auth/reset-password?token=${token}`;
    
    const messageData = {
      to: [to],
      from: this.fromEmail,
      subject: 'Восстановление пароля для NeoOSI',
      html: `
        <p>Здравствуйте!</p>
        <p>Вы получили это письмо, потому что запросили сброс пароля для вашего аккаунта в NeoOSI.</p>
        <p>Пожалуйста, перейдите по ссылке ниже, чтобы установить новый пароль:</p>
        <p><a href="${resetLink}">Установить новый пароль</a></p>
        <p>Если вы не запрашивали сброс пароля, просто проигнорируйте это письмо.</p>
        <br>
        <p>С уважением,</p>
        <p>Команда NeoOSI</p>
      `,
    };

    try {
      await this.client.messages.create(this.domain, messageData);
      console.log(`Письмо для сброса пароля успешно отправлено на ${to} через Mailgun.`);
    } catch (error) {
      console.error('Ошибка при отправке email через Mailgun:', error);
    }
  }
}