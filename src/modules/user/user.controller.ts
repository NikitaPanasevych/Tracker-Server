import {
  Body,
  Controller,
  Get,
  Post,
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
}
