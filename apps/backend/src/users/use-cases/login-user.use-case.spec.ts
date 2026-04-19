import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { LoginUserUseCase } from './login-user.use-case';
import { UserRepository } from '../repositories/user.repository';
import { User } from '../domain/user.entity';

describe('LoginUserUseCase', () => {
  let useCase: LoginUserUseCase;
  let userRepository: jest.Mocked<UserRepository>;
  let jwtService: jest.Mocked<JwtService>;

  beforeEach(() => {
    userRepository = {
      findByEmail: jest.fn(),
      findById: jest.fn(),
      create: jest.fn(),
    } as unknown as jest.Mocked<UserRepository>;
    jwtService = {
      signAsync: jest.fn(),
    } as unknown as jest.Mocked<JwtService>;
    useCase = new LoginUserUseCase(userRepository, jwtService);
  });

  it('should login successfully with valid credentials', async () => {
    const password = 'password123';
    const passwordHash = await bcrypt.hash(password, 10);
    const user = User.create({
      id: 'user-id',
      name: 'John Doe',
      email: 'john@example.com',
      passwordHash,
      city: 'Florianópolis',
      state: 'SC',
    });

    const dto = { email: 'john@example.com', password };

    userRepository.findByEmail.mockResolvedValue(user);
    jwtService.signAsync.mockResolvedValue('fake-jwt-token');

    const result = await useCase.execute(dto);

    expect(result.accessToken).toBe('fake-jwt-token');
    expect(result.user.email).toBe(dto.email);
    expect(result.user.name).toBe(user.getName());
  });

  it('should throw UnauthorizedException if user not found', async () => {
    const dto = { email: 'notfound@example.com', password: 'any' };
    userRepository.findByEmail.mockResolvedValue(null);

    await expect(useCase.execute(dto)).rejects.toThrow(UnauthorizedException);
  });

  it('should throw UnauthorizedException if password is incorrect', async () => {
    const passwordHash = await bcrypt.hash('correct-password', 10);
    const user = User.create({
      name: 'John',
      email: 'john@example.com',
      passwordHash,
      city: 'Florianópolis',
      state: 'SC',
    });

    const dto = { email: 'john@example.com', password: 'wrong-password' };
    userRepository.findByEmail.mockResolvedValue(user);

    await expect(useCase.execute(dto)).rejects.toThrow(UnauthorizedException);
  });
});
