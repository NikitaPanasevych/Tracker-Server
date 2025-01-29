import { Module } from '@nestjs/common';
import { UserModule } from '../user/user.module';
import { EmailModule } from '../email/email.module';
import { AuthService } from './auth.service';

@Module({
  imports: [UserModule, EmailModule],
  providers: [AuthService],
})
export class AuthModule {}
