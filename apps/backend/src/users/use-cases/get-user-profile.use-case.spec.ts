import { NotFoundException } from '@nestjs/common';
import { GetUserProfileUseCase } from './get-user-profile.use-case';
import { UserRepository } from '../repositories/user.repository';
import { User } from '../domain/user.entity';

describe('GetUserProfileUseCase', () => {
  let useCase: GetUserProfileUseCase;
  let userRepository: jest.Mocked<UserRepository>;

  beforeEach(() => {
    userRepository = {
      findById: jest.fn(),
    } as unknown as jest.Mocked<UserRepository>;
    useCase = new GetUserProfileUseCase(userRepository);
  });

  it('should return user profile if found', async () => {
    const user = User.create({
      name: 'John Doe',
      email: 'john@example.com',
      passwordHash: 'hash',
      city: 'Florianópolis',
      state: 'SC',
    });

    userRepository.findById.mockResolvedValue(user);

    const result = await useCase.execute('any-id');

    expect(result).toBe(user);
    expect(userRepository.findById).toHaveBeenCalledWith('any-id');
  });

  it('should throw NotFoundException if user is not found', async () => {
    userRepository.findById.mockResolvedValue(null);

    await expect(useCase.execute('non-existent-id')).rejects.toThrow(
      NotFoundException,
    );
  });
});
