import { Test, TestingModule } from '@nestjs/testing';
import { CreateEquipmentUseCase } from './create-equipment.use-case';
import { EquipmentRepository } from '../repositories/equipment.repository';
import { UserEquipmentRepository } from '../repositories/user-equipment.repository';
import { Equipment } from '../domain/equipment.entity';
import { UserEquipment } from '../domain/user-equipment.entity';
import { ConflictException, NotFoundException } from '@nestjs/common';

describe('CreateEquipmentUseCase', () => {
  let useCase: CreateEquipmentUseCase;
  let equipmentRepository: EquipmentRepository;
  let userEquipmentRepository: UserEquipmentRepository;

  const mockEquipmentRepository = {
    findById: jest.fn(),
    create: jest.fn().mockImplementation((equipment: Equipment) =>
      Promise.resolve(
        Equipment.create({
          ...equipment,
          id: 'base-id',
          createdAt: new Date(),
          updatedAt: new Date(),
        }),
      ),
    ),
  };

  const mockUserEquipmentRepository = {
    findByUserIdAndEquipmentId: jest.fn(),
    create: jest.fn().mockImplementation((ue: UserEquipment) =>
      Promise.resolve(
        UserEquipment.create({
          ...ue,
          id: 'user-eq-id',
          createdAt: new Date(),
          updatedAt: new Date(),
        }),
      ),
    ),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateEquipmentUseCase,
        { provide: EquipmentRepository, useValue: mockEquipmentRepository },
        { provide: UserEquipmentRepository, useValue: mockUserEquipmentRepository },
      ],
    }).compile();

    useCase = module.get<CreateEquipmentUseCase>(CreateEquipmentUseCase);
    equipmentRepository = module.get<EquipmentRepository>(EquipmentRepository);
    userEquipmentRepository = module.get<UserEquipmentRepository>(UserEquipmentRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should create a new base equipment and associate it to user', async () => {
    const dto = {
      type: 'GRINDER' as const,
      name: 'Blade R3',
      model: 'R3',
      brand: 'MHW 3 Bomber',
      description: 'Test desc',
      photos: [],
      modifications: [],
      typeSpecificData: { clicks: 30 },
    };
    const userId = 'user-123';

    mockUserEquipmentRepository.findByUserIdAndEquipmentId.mockResolvedValue(null);

    const result = await useCase.execute(dto, userId);

    expect(result.id).toBe('base-id');
    expect(result.userEquipmentId).toBe('user-eq-id');
    expect(result.typeSpecificData).toEqual({ clicks: 30 });
    expect(equipmentRepository.create).toHaveBeenCalled();
    expect(userEquipmentRepository.create).toHaveBeenCalled();
  });

  it('should associate existing equipment to user if equipmentId is provided', async () => {
    const existingBase = Equipment.create({
      id: 'existing-id',
      type: 'GRINDER' as const,
      name: 'Existing',
      model: 'Model',
      brand: 'Brand',
      createdById: 'admin',
    });

    const dto = {
      equipmentId: 'existing-id',
      type: 'GRINDER' as const,
      name: 'Ignore',
      model: 'Ignore',
      brand: 'Ignore',
      photos: [],
      modifications: [],
    };
    const userId = 'user-123';

    mockEquipmentRepository.findById.mockResolvedValue(existingBase);
    mockUserEquipmentRepository.findByUserIdAndEquipmentId.mockResolvedValue(null);

    const result = await useCase.execute(dto, userId);

    expect(result.id).toBe('existing-id');
    expect(result.userEquipmentId).toBe('user-eq-id');
    expect(equipmentRepository.create).not.toHaveBeenCalled();
    expect(userEquipmentRepository.create).toHaveBeenCalled();
  });

  it('should throw NotFoundException if equipmentId does not exist', async () => {
    const dto = {
      equipmentId: 'non-existing',
      type: 'GRINDER' as const,
      name: '',
      model: '',
      brand: '',
    };
    mockEquipmentRepository.findById.mockResolvedValue(null);

    await expect(useCase.execute(dto, 'user-123')).rejects.toThrow(NotFoundException);
  });

  it('should throw ConflictException if user already owns the equipment', async () => {
    const existingBase = Equipment.create({
      id: 'existing-id',
      type: 'GRINDER' as const,
      name: 'Existing',
      model: 'Model',
      brand: 'Brand',
      createdById: 'admin',
    });

    const dto = {
      equipmentId: 'existing-id',
      type: 'GRINDER' as const,
      name: '',
      model: '',
      brand: '',
    };

    mockEquipmentRepository.findById.mockResolvedValue(existingBase);
    mockUserEquipmentRepository.findByUserIdAndEquipmentId.mockResolvedValue({ id: 'any' });

    await expect(useCase.execute(dto, 'user-123')).rejects.toThrow(ConflictException);
  });
});

