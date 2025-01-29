import { BadRequestException, Injectable } from '@nestjs/common';
import { UserService } from '../user/user.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { RedisService } from 'src/modules/redis/redis.service';

import * as crypto from 'crypto';
import { EmailService } from '../email/email.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly redisService: RedisService,
    private readonly emailService: EmailService,
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

    // Generate verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationTokenExpires = new Date(Date.now() + 3600000); // 1 hour

    // Register the user
    const user = await this.userService.registerUser({
      email: normalizedEmail,
      password: hashedPassword,
      verificationToken,
      verificationTokenExpires,
      isVerified: false,
    });

    // Send verification email
    await this.emailService.sendVerificationEmail(
      user.email,
      verificationToken,
    );

    return {
      message:
        'Registration successful. Please check your email to verify your account.',
      userId: user.id,
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

    // Check if email is verified
    if (!user.isVerified) {
      throw new BadRequestException(
        'Email not verified. Please check your inbox for the verification link.',
      );
    }

    // Create a JWT payload and sign it
    const payload = { email: user.email, id: user.id };
    const token = await this.jwtService.signAsync(payload);

    return { token };
  }

  async logout(token: string) {
    const decoded = this.jwtService.decode(token);
    const ttl = decoded.exp - Math.floor(Date.now() / 1000);

    await this.redisService.set(`blacklist:${token}`, '1', ttl);
  }

  async verifyEmail(token: string) {
    // Find user by verification token
    const user = await this.userService.findByVerificationToken(token);

    if (!user) {
      throw new BadRequestException('Invalid verification token');
    }

    // Check token expiration
    if (
      !user.verificationTokenExpires ||
      user.verificationTokenExpires < new Date()
    ) {
      throw new BadRequestException('Verification token has expired');
    }

    // Update user verification status
    const updatedUser = await this.userService.updateUser(user.id, {
      isVerified: true,
      verificationToken: null,
      verificationTokenExpires: null,
    });

    return {
      message: 'Email successfully verified',
      user: updatedUser,
    };
  }

  async resendVerificationEmail(email: string) {
    const user = await this.userService.findByEmail(email);

    if (!user) {
      throw new BadRequestException('User not found');
    }

    if (user.isVerified) {
      throw new BadRequestException('Email already verified');
    }

    // Generate new token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    user.verificationToken = verificationToken;
    user.verificationTokenExpires = new Date(Date.now() + 3600000);
    await this.userService.registerUser(user);

    await this.emailService.sendVerificationEmail(
      user.email,
      verificationToken,
    );

    return { message: 'Verification email resent successfully' };
  }
}
