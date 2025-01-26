import { Test } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service';
import { UserService } from './user.service';
import { JwtService } from '@nestjs/jwt';

describe('AuthService', () => {
  let authService: AuthService;
  let userService: UserService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UserService,
          useValue: {
            findByEmail: jest.fn(),
            registerUser: jest
              .fn()
              .mockResolvedValue({ id: 1, email: 'test@test.com' }),
          },
        },
        {
          provide: JwtService,
          useValue: {
            signAsync: jest.fn().mockResolvedValue('fake-jwt-token'),
          },
        },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    userService = module.get<UserService>(UserService);
  });

  describe('registerUser', () => {
    it('should create a user with hashed password', async () => {
      (userService.findByEmail as jest.Mock).mockResolvedValue(null);

      await authService.registerUser('test@test.com', 'password123');

      expect(userService.registerUser).toHaveBeenCalledWith(
        'test@test.com',
        expect.not.stringMatching('password123'),
      );
    });

    it('should throw error if email is already in use', async () => {
      (userService.findByEmail as jest.Mock).mockResolvedValue({
        id: 1,
        email: 'test@test.com',
      });

      await expect(
        authService.registerUser('test@test.com', 'password123'),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('loginUser', () => {
    it('should return JWT for valid credentials', async () => {
      const hashedPassword = await bcrypt.hash('password123', 10);
      (userService.findByEmail as jest.Mock).mockResolvedValue({
        email: 'test@test.com',
        password: hashedPassword,
      });

      const result = await authService.loginUser(
        'test@test.com',
        'password123',
      );
      expect(result.token).toEqual('fake-jwt-token');
    });

    it('should throw error for invalid password', async () => {
      const hashedPassword = await bcrypt.hash('password123', 10);
      (userService.findByEmail as jest.Mock).mockResolvedValue({
        email: 'test@test.com',
        password: hashedPassword,
      });

      await expect(
        authService.loginUser('test@test.com', 'wrongpassword'),
      ).rejects.toThrow(BadRequestException);
    });
  });
});
