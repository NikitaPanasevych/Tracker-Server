import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async registerUser(userData: Partial<User>): Promise<User> {
    const user = this.userRepository.create(userData);
    return this.userRepository.save(user);
  }

  async updateUser(id: number, updates: Partial<User>): Promise<User> {
    await this.userRepository.update(id, updates);
    const updatedUser = await this.userRepository.findOneBy({ id });

    if (!updatedUser) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return updatedUser;
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { email },
      select: ['id', 'email', 'password', 'isVerified', 'verificationToken'],
    });
  }

  async findByResetToken(token: string) {
    const users = await this.userRepository.find({
      select: ['id', 'resetPasswordToken', 'resetPasswordExpires'],
    });

    for (const user of users) {
      if (
        user.resetPasswordToken &&
        (await bcrypt.compare(token, user.resetPasswordToken))
      ) {
        return this.userRepository.findOneBy({ id: user.id });
      }
    }

    return null;
  }

  async getAllUsers(): Promise<User[]> {
    return this.userRepository.find({
      select: ['id', 'email', 'isVerified'],
    });
  }

  async findByVerificationToken(token: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { verificationToken: token },
      select: ['id', 'email', 'verificationToken', 'verificationTokenExpires'],
    });
  }

  async invalidateResetToken(userId: number) {
    await this.userRepository.update(userId, {
      resetPasswordToken: null,
      resetPasswordExpires: null,
    });
  }
}
