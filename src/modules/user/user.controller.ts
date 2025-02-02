import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Post,
  Query,
  Redirect,
  Req,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { AuthService } from '../auth/auth.service';
import { AuthGuard } from 'src/guards/auth.guard';
import { User } from './entities/user.entity';
import { CurrentUser } from 'src/decorators/current-user.decorator';
import { JwtService } from '@nestjs/jwt';
import { TokenBlacklistService } from '../auth/tokenBlacklist.service';
import { ForgotPasswordDto, ResetPasswordDto } from './dto/reset-password.dto';

@Controller('auth')
export class UserController {
  constructor(
    private userService: UserService,
    private AuthService: AuthService,
    private readonly jwtService: JwtService,
    private readonly tokenService: TokenBlacklistService,
  ) {}

  @Post('register')
  async registerUser(@Body() body: CreateUserDto) {
    return this.AuthService.registerUser(body.email, body.password);
  }

  @Post('login')
  async login(@Body() body: CreateUserDto) {
    return this.AuthService.loginUser(body.email, body.password);
  }

  @Get('me')
  @UseGuards(AuthGuard)
  getCurrentUser(@CurrentUser() user: User) {
    return {
      id: user.id,
      email: user.email,
    };
  }

  @Post('logout')
  @UseGuards(AuthGuard)
  async logout(@Req() request: Request) {
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      throw new UnauthorizedException('No authentication token found');
    }

    await this.tokenService.addToBlacklist(token);
    return { message: 'Successfully logged out' };
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers['authorization']?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }

  @Get('verify-email')
  @Redirect('http://localhost:5173/login', 301)
  async verifyEmail(@Query('token') token: string) {
    try {
      return await this.AuthService.verifyEmail(token);
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Email verification failed',
      };
    }
  }

  @Post('resend-confirmation')
  async resendVerification(@Body() { email }: { email: string }) {
    return this.AuthService.resendVerificationEmail(email);
  }

  @Post('forgot-password')
  async forgotPassword(@Body() { email }: ForgotPasswordDto) {
    return this.AuthService.sendPasswordResetEmail(email);
  }

  @Post('reset-password')
  async resetPassword(@Body() { token, newPassword }: ResetPasswordDto) {
    return this.AuthService.resetPassword(token, newPassword);
  }

  @Get('validate-reset-token/:token')
  async validateResetToken(@Param('token') token: string) {
    return this.AuthService.validateResetToken(token);
  }
}
