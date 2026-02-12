console.log('DB exists?', !!process.env.DATABASE_URL);
console.log('ENV KEYS:', Object.keys(process.env).slice(0,10));

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

 
  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  });

const port = process.env.PORT ? Number(process.env.PORT) : 3001;
await app.listen(port);
console.log(`App running on http://localhost:${port}`);
}
bootstrap();