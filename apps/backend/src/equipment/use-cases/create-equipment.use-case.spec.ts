import { Test, TestingModule } from '@nestjs/testing';
import { CreateEquipmentUseCase } from './create-equipment.use-case';
import { EquipmentRepository } from '../repositories/equipment.repository';
import { Equipment } from '../domain/equipment.entity';

describe('CreateEquipmentUseCase', () => {
  let useCase: CreateEquipmentUseCase;
  let repository: EquipmentRepository;

  const mockRepository = {
    create: jest.fn().mockImplementation((equipment: Equipment) => 
      Promise.resolve(Equipment.create({
        ...equipment,
        id: 'some-id',
        createdAt: new Date(),
        updatedAt: new Date(),
      }))
    ),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateEquipmentUseCase,
        { provide: EquipmentRepository, useValue: mockRepository },
      ],
    }).compile();

    useCase = module.get<CreateEquipmentUseCase>(CreateEquipmentUseCase);
    repository = module.get<EquipmentRepository>(EquipmentRepository);
  });

  it('should create an equipment', async () => {
    const dto = {
      type: 'GRINDER' as const,
      name: 'Blade R3',
      model: 'R3',
      brand: 'MHW 3 Bomber',
      description: 'Test desc',
      photos: [],
    };
    const userId = 'user-123';

    const result = await useCase.execute(dto, userId);

    expect(result.getId()).toBe('some-id');
    expect(result.getCreatedById()).toBe(userId);
    expect(repository.create).toHaveBeenCalled();
  });
});
