import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';

@Injectable()
export class UserRepository {
  constructor(
    @InjectRepository(User)
    private readonly repository: Repository<User>,
  ) {}

  async findOneById(id: number): Promise<User | null> {
    return this.repository.findOne({ where: { id } });
  }

  async findOneByNickname(nickname: string): Promise<User | null> {
    return this.repository.findOne({ where: { nickname } });
  }

  async findOneByEmail(email: string): Promise<User | null> {
    return this.repository.findOne({ where: { email } });
  }

  async findOneByGoogleId(googleId: string): Promise<User | null> {
    return this.repository.findOne({ where: { googleId } });
  }

  async findAll(): Promise<User[]> {
    return this.repository.find();
  }

  async create(userData: Partial<User>): Promise<User> {
    const user = this.repository.create(userData);
    return this.repository.save(user);
  }

  async save(user: User): Promise<User> {
    return this.repository.save(user);
  }
}
