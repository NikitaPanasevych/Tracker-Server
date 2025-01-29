import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { AuthService } from '../auth/auth.service';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';
import { RedisModule } from 'src/modules/redis/redis.module';
import { TokenBlacklistService } from '../auth/tokenBlacklist.service';
import { EmailService } from '../email/email.service';

@Module({
  imports: [
    RedisModule,
    TypeOrmModule.forFeature([User]),
    ConfigModule.forRoot(),
    JwtModule.register({
      global: true,
      signOptions: {
        expiresIn: '1d',
      },
      secret: process.env.JWT_SECRET,
    }),
  ],
  controllers: [UserController],
  providers: [UserService, TokenBlacklistService, AuthService, EmailService],
})
export class UserModule {}
