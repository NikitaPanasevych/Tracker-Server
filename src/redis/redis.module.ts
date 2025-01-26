// redis/redis.module.ts
import { Module } from '@nestjs/common';
import { RedisService } from './redis.service';

@Module({
  providers: [RedisService],
  exports: [RedisService], // Crucial for dependency sharing
})
export class RedisModule {}
