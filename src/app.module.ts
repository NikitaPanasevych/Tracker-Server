import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { ExpenseModule } from './expense/expense.module';
import { UserModule } from './user/user.module';

import { redisConfig } from './redis/redis.config';

@Module({
  imports: [
    ExpenseModule,
    ConfigModule.forRoot(), // Automatically load .env variables
    TypeOrmModule.forRoot({
      type: 'mssql',
      host: process.env.DATABASE_HOST,
      port: 1433,
      username: process.env.DATABASE_USERNAME,
      password: process.env.DATABASE_PASSWORD,
      database: process.env.DATABASE_NAME,
      entities: [__dirname + '/**/*.entity{.ts,.js}'], // Adjusted entity path
      synchronize: true, // Turn this off in production!
      extra: {
        encrypt: true, // Required for Azure SQL
      },
    }),
    UserModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
