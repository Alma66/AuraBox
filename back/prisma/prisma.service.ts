import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  async onModuleInit() {
    console.log('>>> PRISMA onModuleInit: DATABASE_URL exists?', !!process.env.DATABASE_URL);
    console.log('>>> PRISMA onModuleInit: env keys (slice):', Object.keys(process.env).slice(0, 10));
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
