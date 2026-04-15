import { ConflictException, BadRequestException, Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { User } from '../domain/user.entity';
import { RegisterUserDto } from '../dto/register-user.dto';
import { UserRepository } from '../repositories/user.repository';

@Injectable()
export class RegisterUserUseCase {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(dto: RegisterUserDto): Promise<User> {
    if (dto.password !== dto.confirmPassword) {
      throw new BadRequestException('As senhas não coincidem');
    }

    const existingUser = await this.userRepository.findByEmail(dto.email);
    if (existingUser) {
      throw new ConflictException('E-mail já está em uso');
    }

    const salt = await bcrypt.genSalt();
    const passwordHash = await bcrypt.hash(dto.password, salt);

    const user = User.create({
      name: dto.name,
      email: dto.email,
      passwordHash,
    });

    return this.userRepository.create(user);
  }
}
