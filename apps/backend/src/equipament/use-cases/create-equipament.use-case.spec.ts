import { Test, TestingModule } from '@nestjs/testing';
import { CreateEquipamentUseCase } from './create-equipament.use-case';
import { EquipamentRepository } from '../repositories/equipament.repository';
import { UserEquipamentRepository } from '../repositories/user-equipament.repository';
import { Equipament } from '../domain/equipament.entity';
import { UserEquipament } from '../domain/user-equipament.entity';
import { ConflictException, NotFoundException } from '@nestjs/common';

describe('CreateEquipamentUseCase', () => {
  let useCase: CreateEquipamentUseCase;
  let equipamentRepository: EquipamentRepository;
  let userEquipamentRepository: UserEquipamentRepository;

  const mockEquipamentRepository = {
    findById: jest.fn(),
    create: jest.fn().mockImplementation((equipament: Equipament) =>
      Promise.resolve(
        Equipament.create({
          ...equipament,
          id: 'base-id',
          createdAt: new Date(),
          updatedAt: new Date(),
        }),
      ),
    ),
  };

  const mockUserEquipamentRepository = {
    findByUserIdAndEquipamentId: jest.fn(),
    create: jest.fn().mockImplementation((ue: UserEquipament) =>
      Promise.resolve(
        UserEquipament.create({
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
        CreateEquipamentUseCase,
        { provide: EquipamentRepository, useValue: mockEquipamentRepository },
        { provide: UserEquipamentRepository, useValue: mockUserEquipamentRepository },
      ],
    }).compile();

    useCase = module.get<CreateEquipamentUseCase>(CreateEquipamentUseCase);
    equipamentRepository = module.get<EquipamentRepository>(EquipamentRepository);
    userEquipamentRepository = module.get<UserEquipamentRepository>(UserEquipamentRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should create a new base equipament and associate it to user', async () => {
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

    mockUserEquipamentRepository.findByUserIdAndEquipamentId.mockResolvedValue(null);

    const result = await useCase.execute(dto, userId);

    expect(result.id).toBe('base-id');
    expect(result.userEquipamentId).toBe('user-eq-id');
    expect(result.typeSpecificData).toEqual({ clicks: 30 });
    expect(equipamentRepository.create).toHaveBeenCalled();
    expect(userEquipamentRepository.create).toHaveBeenCalled();
  });

  it('should associate existing equipament to user if equipamentId is provided', async () => {
    const existingBase = Equipament.create({
      id: 'existing-id',
      type: 'GRINDER' as const,
      name: 'Existing',
      model: 'Model',
      brand: 'Brand',
      createdById: 'admin',
    });

    const dto = {
      equipamentId: 'existing-id',
      type: 'GRINDER' as const,
      name: 'Ignore',
      model: 'Ignore',
      brand: 'Ignore',
      photos: [],
      modifications: [],
    };
    const userId = 'user-123';

    mockEquipamentRepository.findById.mockResolvedValue(existingBase);
    mockUserEquipamentRepository.findByUserIdAndEquipamentId.mockResolvedValue(null);

    const result = await useCase.execute(dto, userId);

    expect(result.id).toBe('existing-id');
    expect(result.userEquipamentId).toBe('user-eq-id');
    expect(equipamentRepository.create).not.toHaveBeenCalled();
    expect(userEquipamentRepository.create).toHaveBeenCalled();
  });

  it('should throw NotFoundException if equipamentId does not exist', async () => {
    const dto = {
      equipamentId: 'non-existing',
      type: 'GRINDER' as const,
      name: '',
      model: '',
      brand: '',
    };
    mockEquipamentRepository.findById.mockResolvedValue(null);

    await expect(useCase.execute(dto, 'user-123')).rejects.toThrow(NotFoundException);
  });

  it('should throw ConflictException if user already owns the equipament', async () => {
    const existingBase = Equipament.create({
      id: 'existing-id',
      type: 'GRINDER' as const,
      name: 'Existing',
      model: 'Model',
      brand: 'Brand',
      createdById: 'admin',
    });

    const dto = {
      equipamentId: 'existing-id',
      type: 'GRINDER' as const,
      name: '',
      model: '',
      brand: '',
    };

    mockEquipamentRepository.findById.mockResolvedValue(existingBase);
    mockUserEquipamentRepository.findByUserIdAndEquipamentId.mockResolvedValue({ id: 'any' });

    await expect(useCase.execute(dto, 'user-123')).rejects.toThrow(ConflictException);
  });
});

