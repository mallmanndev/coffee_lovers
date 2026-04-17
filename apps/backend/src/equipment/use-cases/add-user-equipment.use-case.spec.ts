import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException } from '@nestjs/common';
import { AddUserEquipmentUseCase } from './add-user-equipment.use-case';
import { CreateEquipmentUseCase } from './create-equipment.use-case';
import { UserEquipmentRepository } from '../repositories/user-equipment.repository';
import { Equipment } from '../domain/equipment.entity';
import { UserEquipment } from '../domain/user-equipment.entity';

describe('AddUserEquipmentUseCase', () => {
  let useCase: AddUserEquipmentUseCase;
  let createEquipmentUseCase: CreateEquipmentUseCase;
  let userEquipmentRepository: UserEquipmentRepository;

  const mockEquipment = Equipment.create({
    id: 'base-eq-123',
    type: 'GRINDER' as const,
    name: 'Blade R3',
    model: 'R3',
    brand: 'MHW 3 Bomber',
    createdById: 'user-123',
  });

  const mockCreateEquipmentUseCase = {
    execute: jest.fn().mockResolvedValue(mockEquipment),
  };

  const mockUserEquipmentRepository = {
    findByUserIdAndEquipmentId: jest.fn(),
    create: jest.fn().mockImplementation((ue: UserEquipment) => 
      Promise.resolve(UserEquipment.create({
        ...ue,
        id: 'user-eq-456',
        createdAt: new Date(),
        updatedAt: new Date(),
      }))
    ),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AddUserEquipmentUseCase,
        { provide: CreateEquipmentUseCase, useValue: mockCreateEquipmentUseCase },
        { provide: UserEquipmentRepository, useValue: mockUserEquipmentRepository },
      ],
    }).compile();

    useCase = module.get<AddUserEquipmentUseCase>(AddUserEquipmentUseCase);
    createEquipmentUseCase = module.get<CreateEquipmentUseCase>(CreateEquipmentUseCase);
    userEquipmentRepository = module.get<UserEquipmentRepository>(UserEquipmentRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should create base equipment and user equipment successfully', async () => {
    const userId = 'user-123';
    const dto = {
      base: {
        type: 'GRINDER' as const,
        name: 'Blade R3',
        model: 'R3',
        brand: 'MHW 3 Bomber',
      },
      user: {
        description: 'Meu moedor preferido',
        typeSpecificData: { clicks: 30 },
      },
    };

    mockUserEquipmentRepository.findByUserIdAndEquipmentId.mockResolvedValue(null);

    const result = await useCase.execute(dto, userId);

    expect(createEquipmentUseCase.execute).toHaveBeenCalledWith(dto.base, userId);
    expect(userEquipmentRepository.findByUserIdAndEquipmentId).toHaveBeenCalledWith(userId, 'base-eq-123');
    expect(userEquipmentRepository.create).toHaveBeenCalled();
    expect(result.equipment.getId()).toBe('base-eq-123');
    expect(result.userEquipment.getTypeSpecificData()).toEqual({ clicks: 30 });
  });

  it('should throw ConflictException if user already has the equipment', async () => {
    const userId = 'user-123';
    const dto = {
      base: {
        type: 'GRINDER' as const,
        name: 'Blade R3',
        model: 'R3',
        brand: 'MHW 3 Bomber',
      },
      user: {},
    };

    mockUserEquipmentRepository.findByUserIdAndEquipmentId.mockResolvedValue({ id: 'already-exists' });

    await expect(useCase.execute(dto, userId)).rejects.toThrow(ConflictException);
    expect(userEquipmentRepository.create).not.toHaveBeenCalled();
  });
});