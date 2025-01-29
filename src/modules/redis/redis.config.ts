import { RedisModuleOptions } from '@nestjs-modules/ioredis';

export const redisConfig: RedisModuleOptions = {
  type: 'single',
  options: {
    host: process.env.REDIS_HOST,
    port: 16327,
    password: process.env.REDIS_PASSWORD,
    maxRetriesPerRequest: 3,
    enableOfflineQueue: true,
    connectTimeout: 1000,
  },
};
