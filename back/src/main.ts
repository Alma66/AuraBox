import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  try {
    const app = await NestFactory.create(AppModule);

    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );

    app.enableCors({
      origin: true, 
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    });

    const port = process.env.PORT ? Number(process.env.PORT) : 3001;

    await app.listen(port);
    console.log(`🚀 Server running on port ${port}`);
  } catch (err) {
    console.error('❌ BOOTSTRAP ERROR:', err);
    process.exit(1);
  }
}

bootstrap();