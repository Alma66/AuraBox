import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  console.log('>>> BOOTSTRAP: env keys (first 20):', Object.keys(process.env).slice(0, 20));
  console.log('>>> BOOTSTRAP: DATABASE_URL exists?', !!process.env.DATABASE_URL);

  try {
    const app = await NestFactory.create(AppModule);

    app.enableCors({
      origin: process.env.FRONTEND_URL || 'http://localhost:3000',
      credentials: true,
    });

    const port = process.env.PORT ? Number(process.env.PORT) : 3001;
    await app.listen(port);
    console.log(`App running on http://localhost:${port}`);
  } catch (err) {
    console.error('>>> BOOTSTRAP ERROR:', err);
    process.exit(1);
  }
}

bootstrap();
