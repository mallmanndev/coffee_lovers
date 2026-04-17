import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { DeleteUserEquipmentUseCase } from './delete-user-equipment.use-case';
import { UserEquipmentRepository } from '../repositories/user-equipment.repository';
import { UserEquipment } from '../domain/user-equipment.entity';

describe('DeleteUserEquipmentUseCase', () => {
  let useCase: DeleteUserEquipmentUseCase;
  let userEquipmentRepository: UserEquipmentRepository;

  const mockUserEquipment = UserEquipment.create({
    id: 'user-eq-456',
    userId: 'user-123',
    equipmentId: 'base-eq-123',
  });

  const mockUserEquipmentRepository = {
    findByUserIdAndEquipmentId: jest.fn(),
    delete: jest.fn().mockResolvedValue(undefined),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DeleteUserEquipmentUseCase,
        { provide: UserEquipmentRepository, useValue: mockUserEquipmentRepository },
      ],
    }).compile();

    useCase = module.get<DeleteUserEquipmentUseCase>(DeleteUserEquipmentUseCase);
    userEquipmentRepository = module.get<UserEquipmentRepository>(UserEquipmentRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should delete user equipment successfully', async () => {
    const userId = 'user-123';
    const equipmentId = 'base-eq-123';

    mockUserEquipmentRepository.findByUserIdAndEquipmentId.mockResolvedValue(mockUserEquipment);

    await useCase.execute(equipmentId, userId);

    expect(userEquipmentRepository.findByUserIdAndEquipmentId).toHaveBeenCalledWith(userId, equipmentId);
    expect(userEquipmentRepository.delete).toHaveBeenCalledWith(userId, equipmentId);
  });

  it('should throw NotFoundException if user equipment does not exist to delete', async () => {
    const userId = 'user-123';
    const equipmentId = 'unknown-eq';

    mockUserEquipmentRepository.findByUserIdAndEquipmentId.mockResolvedValue(null);

    await expect(useCase.execute(equipmentId, userId)).rejects.toThrow(NotFoundException);
    expect(userEquipmentRepository.delete).not.toHaveBeenCalled();
  });
});