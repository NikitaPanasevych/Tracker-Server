import { Injectable } from '@nestjs/common';
import { RedisService } from '../redis/redis.service';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class TokenBlacklistService {
  constructor(
    private readonly redisService: RedisService,
    private readonly jwtService: JwtService,
  ) {}

  async addToBlacklist(token: string): Promise<void> {
    try {
      const decoded = this.jwtService.decode(token);

      if (!decoded || !decoded.exp) {
        throw new Error('Invalid token format');
      }

      const ttl = decoded.exp - Math.floor(Date.now() / 1000);

      if (ttl > 0) {
        await this.redisService.set(`blacklist:${token}`, 'true', ttl);
      }
    } catch (error) {
      throw new Error(`Failed to blacklist token: ${error.message}`);
    }
  }

  async isTokenBlacklisted(token: string): Promise<boolean> {
    return await this.redisService.exists(`blacklist:${token}`);
  }
}
