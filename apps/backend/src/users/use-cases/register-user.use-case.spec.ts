import { ConflictException, BadRequestException } from '@nestjs/common';
import { RegisterUserUseCase } from './register-user.use-case';
import { UserRepository } from '../repositories/user.repository';
import * as bcrypt from 'bcrypt';
import { User } from '../domain/user.entity';

describe('RegisterUserUseCase', () => {
  let useCase: RegisterUserUseCase;
  let userRepository: jest.Mocked<UserRepository>;

  beforeEach(() => {
    userRepository = {
      create: jest.fn(),
      findByEmail: jest.fn(),
      findById: jest.fn(),
    } as unknown as jest.Mocked<UserRepository>;
    useCase = new RegisterUserUseCase(userRepository);
  });

  it('should register a new user successfully', async () => {
    const dto = {
      name: 'John Doe',
      email: 'john@example.com',
      password: 'password123',
      confirmPassword: 'password123',
      city: 'Florianópolis',
      state: 'SC',
    };

    userRepository.findByEmail.mockResolvedValue(null);
    userRepository.create.mockImplementation(async (user) => user);

    const result = await useCase.execute(dto);

    expect(result.getName()).toBe(dto.name);
    expect(result.getEmail()).toBe(dto.email);
    expect(result.getCity()).toBe(dto.city);
    expect(result.getState()).toBe(dto.state);
    expect(await bcrypt.compare(dto.password, result.getPasswordHash())).toBe(
      true,
    );
    expect(userRepository.create).toHaveBeenCalled();
  });

  it('should throw BadRequestException if passwords do not match', async () => {
    const dto = {
      name: 'John Doe',
      email: 'john@example.com',
      password: 'password123',
      confirmPassword: 'differentpassword',
      city: 'Florianópolis',
      state: 'SC',
    };

    await expect(useCase.execute(dto)).rejects.toThrow(BadRequestException);
  });

  it('should throw ConflictException if email already exists', async () => {
    const dto = {
      name: 'John Doe',
      email: 'john@example.com',
      password: 'password123',
      confirmPassword: 'password123',
      city: 'Florianópolis',
      state: 'SC',
    };

    userRepository.findByEmail.mockResolvedValue(
      User.create({
        name: 'Existing',
        email: dto.email,
        passwordHash: 'hash',
        city: 'Florianópolis',
        state: 'SC',
      }),
    );

    await expect(useCase.execute(dto)).rejects.toThrow(ConflictException);
  });
});
