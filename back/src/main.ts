import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  console.log('>>> BOOTSTRAP: Starting AuraBox Backend...');
  console.log('>>> BOOTSTRAP: PORT:', process.env.PORT);
  
  try {
    const app = await NestFactory.create(AppModule);

    const allowedOrigins = [
      'http://localhost:3000',
      process.env.FRONTEND_URL 
    ].filter(Boolean);

    app.enableCors({
      origin: (origin, callback) => {
        if (!origin) return callback(null, true);
        
        if (allowedOrigins.includes(origin)) {
          callback(null, true);
        } else if (origin.includes('.vercel.app')) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
      },
      methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
      credentials: true, 
    });

    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));

    const port = process.env.PORT ? Number(process.env.PORT) : 3001;
    await app.listen(port);
    
    console.log(`>>> BOOTSTRAP: App running on port ${port}`);
    console.log(`>>> BOOTSTRAP: Frontend allowed: ${process.env.FRONTEND_URL || 'localhost'}`);
  } catch (err) {
    console.error('>>> BOOTSTRAP ERROR:', err);
    process.exit(1);
  }
}

bootstrap();