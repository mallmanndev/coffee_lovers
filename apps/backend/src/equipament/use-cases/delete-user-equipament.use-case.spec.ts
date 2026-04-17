import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { DeleteUserEquipamentUseCase } from './delete-user-equipament.use-case';
import { UserEquipamentRepository } from '../repositories/user-equipament.repository';
import { UserEquipament } from '../domain/user-equipament.entity';

describe('DeleteUserEquipamentUseCase', () => {
  let useCase: DeleteUserEquipamentUseCase;
  let userEquipamentRepository: UserEquipamentRepository;

  const mockUserEquipament = UserEquipament.create({
    id: 'user-eq-456',
    userId: 'user-123',
    equipamentId: 'base-eq-123',
  });

  const mockUserEquipamentRepository = {
    findByUserIdAndEquipamentId: jest.fn(),
    delete: jest.fn().mockResolvedValue(undefined),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DeleteUserEquipamentUseCase,
        { provide: UserEquipamentRepository, useValue: mockUserEquipamentRepository },
      ],
    }).compile();

    useCase = module.get<DeleteUserEquipamentUseCase>(DeleteUserEquipamentUseCase);
    userEquipamentRepository = module.get<UserEquipamentRepository>(UserEquipamentRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should delete user equipament successfully', async () => {
    const userId = 'user-123';
    const equipamentId = 'base-eq-123';

    mockUserEquipamentRepository.findByUserIdAndEquipamentId.mockResolvedValue(mockUserEquipament);

    await useCase.execute(equipamentId, userId);

    expect(userEquipamentRepository.findByUserIdAndEquipamentId).toHaveBeenCalledWith(userId, equipamentId);
    expect(userEquipamentRepository.delete).toHaveBeenCalledWith(userId, equipamentId);
  });

  it('should throw NotFoundException if user equipament does not exist to delete', async () => {
    const userId = 'user-123';
    const equipamentId = 'unknown-eq';

    mockUserEquipamentRepository.findByUserIdAndEquipamentId.mockResolvedValue(null);

    await expect(useCase.execute(equipamentId, userId)).rejects.toThrow(NotFoundException);
    expect(userEquipamentRepository.delete).not.toHaveBeenCalled();
  });
});