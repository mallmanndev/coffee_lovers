import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { UpdateUserEquipmentUseCase } from './update-user-equipment.use-case';
import { UserEquipmentRepository } from '../repositories/user-equipment.repository';
import { UserEquipment } from '../domain/user-equipment.entity';

describe('UpdateUserEquipmentUseCase', () => {
  let useCase: UpdateUserEquipmentUseCase;
  let userEquipmentRepository: UserEquipmentRepository;

  const mockUserEquipment = UserEquipment.create({
    id: 'user-eq-456',
    userId: 'user-123',
    equipmentId: 'base-eq-123',
    description: 'Old description',
    typeSpecificData: { clicks: 20 },
  });

  const mockUserEquipmentRepository = {
    findByUserIdAndEquipmentId: jest.fn(),
    update: jest.fn().mockImplementation((ue: UserEquipment) => Promise.resolve(ue)),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UpdateUserEquipmentUseCase,
        { provide: UserEquipmentRepository, useValue: mockUserEquipmentRepository },
      ],
    }).compile();

    useCase = module.get<UpdateUserEquipmentUseCase>(UpdateUserEquipmentUseCase);
    userEquipmentRepository = module.get<UserEquipmentRepository>(UserEquipmentRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should update user equipment successfully', async () => {
    const userId = 'user-123';
    const equipmentId = 'base-eq-123';
    const dto = {
      description: 'New description',
      typeSpecificData: { clicks: 25 },
    };

    mockUserEquipmentRepository.findByUserIdAndEquipmentId.mockResolvedValue(mockUserEquipment);

    const result = await useCase.execute(equipmentId, userId, dto);

    expect(userEquipmentRepository.findByUserIdAndEquipmentId).toHaveBeenCalledWith(userId, equipmentId);
    expect(userEquipmentRepository.update).toHaveBeenCalled();
    expect(result.getDescription()).toBe('New description');
    expect(result.getTypeSpecificData()).toEqual({ clicks: 25 });
  });

  it('should throw NotFoundException if user equipment does not exist', async () => {
    const userId = 'user-123';
    const equipmentId = 'unknown-eq';
    const dto = { description: 'New description' };

    mockUserEquipmentRepository.findByUserIdAndEquipmentId.mockResolvedValue(null);

    await expect(useCase.execute(equipmentId, userId, dto)).rejects.toThrow(NotFoundException);
    expect(userEquipmentRepository.update).not.toHaveBeenCalled();
  });
});