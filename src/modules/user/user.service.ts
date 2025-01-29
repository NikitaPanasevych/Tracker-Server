import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class UserService {
  constructor(@InjectRepository(User) private repo: Repository<User>) {}

  registerUser(userData: Partial<User>): Promise<User> {
    const user = this.repo.create(userData);
    return this.repo.save(user);
  }

  async updateUser(id: number, updates: Partial<User>) {
    await this.repo.update(id, updates);
    return this.repo.findOneBy({ id });
  }

  findByEmail(email: string) {
    return this.repo.findOne({ where: { email } });
  }

  getAllUsers() {
    return this.repo.find();
  }

  async findByVerificationToken(token: string) {
    return this.repo.findOne({
      where: { verificationToken: token },
    });
  }
}
