import { BadRequestException, Injectable } from '@nestjs/common';
import { UserService } from './user.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  async registerUser(email: string, password: string) {
    const normalizedEmail = email.toLowerCase();

    // Check if the user already exists
    const existingUser = await this.userService.findByEmail(normalizedEmail);
    if (existingUser) {
      throw new BadRequestException('Email is already in use');
    }

    // Hash the password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Register the user
    const user = await this.userService.registerUser(
      normalizedEmail,
      hashedPassword,
    );

    // Return basic user information
    return {
      id: user.id,
      email: user.email,
    };
  }

  async loginUser(email: string, password: string) {
    const normalizedEmail = email.toLowerCase();

    // Find the user by email
    const user = await this.userService.findByEmail(normalizedEmail);
    if (!user) {
      throw new BadRequestException('Invalid credentials');
    }

    // Verify the password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new BadRequestException('Invalid credentials');
    }

    // Create a JWT payload and sign it
    const payload = { email: user.email, id: user.id };
    const token = await this.jwtService.signAsync(payload);

    // Return the token
    return { token };
  }
}
