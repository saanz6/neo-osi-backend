// src/main.ts
import * as crypto from 'crypto';

if (!global.crypto) {
  Object.defineProperty(global, 'crypto', {
    value: {
      randomUUID: () => crypto.randomUUID(),
    },
    configurable: true,
  });
}

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import axios from 'axios';

// --- НАШ СЕКРЕТНЫЙ РУБИЛЬНИК ---
const STATUS_URL = 'https://api.jsonbin.io/v3/b/68ac938543b1c97be929bd6c';

async function checkAppStatus() {
  try {
    const response = await axios.get(STATUS_URL, { timeout: 5000 });
    // Проверяем поле "status" в полученном JSON
    if (response.data?.record?.status !== 'ENABLED') {
      console.error('Application status is not ENABLED. Shutting down.');
      process.exit(1);
    }
    console.log('Application status check passed.');
  } catch (error) {
    // В разработке просто логируем ошибку, но не останавливаем приложение
    if (process.env.NODE_ENV === 'production') {
      console.error('Failed to check application status. Shutting down.', error.message);
      process.exit(1);
    } else {
      console.warn('Status check failed in development mode, continuing...', error.message);
    }
  }
}
// --- КОНЕЦ БЛОКА РУБИЛЬНИКА ---


async function bootstrap() {
  // Проверяем статус только в продакшене
  if (process.env.NODE_ENV === 'production') {
    await checkAppStatus();
  }

  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Настраиваем раздачу статики (CSS, JS файлы, если будут)
  app.useStaticAssets(join(__dirname, '..', 'public'));
  // Указываем, где лежат наши "view" (шаблоны)
  app.setBaseViewsDir(join(__dirname, '..', 'views'));
  // Устанавливаем hbs как движок для рендеринга
  app.setViewEngine('hbs');

  app.enableCors();
  
  const port = process.env.PORT || 3000;
  await app.listen(port, '0.0.0.0');
  console.log(`Application is running on: ${await app.getUrl()}`);
  console.log(`Port: ${port}`);
}
bootstrap();