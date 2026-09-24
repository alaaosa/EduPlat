import dotenv from 'dotenv';

dotenv.config();

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { TrimPipe } from './common/pipe/trim.pipe';
import type { NestExpressApplication } from '@nestjs/platform-express';
import session from 'express-session';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    rawBody: true,
  });

  app.useGlobalPipes(
    new TrimPipe(),
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  app.use(
    session({
      secret: process.env.SESSION_SECRET!,
      resave: false,
      saveUninitialized: false,

      cookie: {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 10 * 60 * 1000,
      },
    }),
  );

  app.setBaseViewsDir(join(__dirname , '..' , 'views'))
  app.setViewEngine('hbs')
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
