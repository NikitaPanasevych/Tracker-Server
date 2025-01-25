import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { AuthService } from './auth.service';
import { AuthGuard } from 'src/guards/auth.guard';

@Controller('auth')
export class UserController {
  constructor(
    private userService: UserService,
    private AuthService: AuthService,
  ) {}

  @Post('register')
  async registerUser(@Body() body: CreateUserDto) {
    return this.AuthService.registerUser(body.email, body.password);
  }

  @Post('login')
  async login(@Body() body: CreateUserDto) {
    return this.AuthService.loginUser(body.email, body.password);
  }

  @UseGuards(AuthGuard)
  @Get('')
  getAllUsers() {
    return this.userService.getAllUsers();
  }
}
