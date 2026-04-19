import { Injectable, NotFoundException } from '@nestjs/common';
import { UserRepository } from '../repositories/user.repository';
import { User } from '../domain/user.entity';

@Injectable()
export class GetUserProfileUseCase {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(id: string): Promise<User> {
    const user = await this.userRepository.findById(id);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }
}
