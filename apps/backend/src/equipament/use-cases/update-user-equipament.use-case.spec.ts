import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { UpdateUserEquipamentUseCase } from './update-user-equipament.use-case';
import { UserEquipamentRepository } from '../repositories/user-equipament.repository';
import { UserEquipament } from '../domain/user-equipament.entity';

describe('UpdateUserEquipamentUseCase', () => {
  let useCase: UpdateUserEquipamentUseCase;
  let userEquipamentRepository: UserEquipamentRepository;

  const mockUserEquipament = UserEquipament.create({
    id: 'user-eq-456',
    userId: 'user-123',
    equipamentId: 'base-eq-123',
    description: 'Old description',
    typeSpecificData: { clicks: 20 },
  });

  const mockUserEquipamentRepository = {
    findByUserIdAndEquipamentId: jest.fn(),
    update: jest.fn().mockImplementation((ue: UserEquipament) => Promise.resolve(ue)),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UpdateUserEquipamentUseCase,
        { provide: UserEquipamentRepository, useValue: mockUserEquipamentRepository },
      ],
    }).compile();

    useCase = module.get<UpdateUserEquipamentUseCase>(UpdateUserEquipamentUseCase);
    userEquipamentRepository = module.get<UserEquipamentRepository>(UserEquipamentRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should update user equipament successfully', async () => {
    const userId = 'user-123';
    const equipamentId = 'base-eq-123';
    const dto = {
      description: 'New description',
      typeSpecificData: { clicks: 25 },
    };

    mockUserEquipamentRepository.findByUserIdAndEquipamentId.mockResolvedValue(mockUserEquipament);

    const result = await useCase.execute(equipamentId, userId, dto);

    expect(userEquipamentRepository.findByUserIdAndEquipamentId).toHaveBeenCalledWith(userId, equipamentId);
    expect(userEquipamentRepository.update).toHaveBeenCalled();
    expect(result.getDescription()).toBe('New description');
    expect(result.getTypeSpecificData()).toEqual({ clicks: 25 });
  });

  it('should throw NotFoundException if user equipament does not exist', async () => {
    const userId = 'user-123';
    const equipamentId = 'unknown-eq';
    const dto = { description: 'New description' };

    mockUserEquipamentRepository.findByUserIdAndEquipamentId.mockResolvedValue(null);

    await expect(useCase.execute(equipamentId, userId, dto)).rejects.toThrow(NotFoundException);
    expect(userEquipamentRepository.update).not.toHaveBeenCalled();
  });
});