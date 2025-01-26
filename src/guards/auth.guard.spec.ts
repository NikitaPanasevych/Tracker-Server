import { JwtService } from '@nestjs/jwt';
import { AuthGuard } from './auth.guard';
import { Test } from '@nestjs/testing';
import { ExecutionContext, UnauthorizedException } from '@nestjs/common';

// auth.guard.spec.ts
describe('AuthGuard', () => {
  let guard: AuthGuard;
  let jwtService: JwtService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        AuthGuard,
        {
          provide: JwtService,
          useValue: {
            verifyAsync: jest.fn(),
          },
        },
      ],
    }).compile();

    guard = module.get<AuthGuard>(AuthGuard);
    jwtService = module.get<JwtService>(JwtService);
  });

  it('should allow access with valid token', async () => {
    (jwtService.verifyAsync as jest.Mock).mockResolvedValue({ id: 1 });
    const context = {
      switchToHttp: () => ({
        getRequest: () => ({
          headers: { authorization: 'Bearer valid-token' },
        }),
      }),
    };

    await expect(guard.canActivate(context as ExecutionContext)).resolves.toBe(
      true,
    );
  });

  it('should block access with invalid token', async () => {
    (jwtService.verifyAsync as jest.Mock).mockRejectedValue(
      new Error('Invalid token'),
    );
    const context = {
      switchToHttp: () => ({
        getRequest: () => ({
          headers: { authorization: 'Bearer invalid-token' },
        }),
      }),
    };

    await expect(
      guard.canActivate(context as ExecutionContext),
    ).rejects.toThrow(UnauthorizedException);
  });
});
