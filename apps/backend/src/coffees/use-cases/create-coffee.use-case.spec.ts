import { Test, TestingModule } from '@nestjs/testing';
import { CoffeeRepository } from '../repositories/coffee.repository';
import { CreateCoffeeUseCase } from './create-coffee.use-case';
import { Coffee } from '../domain/coffee.entity';

describe('CreateCoffeeUseCase', () => {
  let useCase: CreateCoffeeUseCase;
  let coffeeRepository: CoffeeRepository;

  const mockCoffeeRepository = {
    create: jest.fn().mockImplementation((coffee: Coffee) =>
      Promise.resolve(
        Coffee.create({
          id: 'coffee-id-1',
          coffee_name: coffee.getCoffeeName(),
          producer_farm: coffee.getProducerFarm() ?? undefined,
          roastery: coffee.getRoastery(),
          origin_country: coffee.getOriginCountry() ?? undefined,
          region: coffee.getRegion() ?? undefined,
          altitude_meters: coffee.getAltitudeMeters(),
          variety: coffee.getVariety() ?? undefined,
          processing: coffee.getProcessing() ?? undefined,
          roast: coffee.getRoast() ?? undefined,
          sensory_profile: coffee.getSensoryProfile() ?? undefined,
          userId: coffee.getUserId(),
          createdAt: new Date('2026-01-01T12:00:00.000Z'),
          updatedAt: new Date('2026-01-01T12:00:00.000Z'),
        }),
      ),
    ),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateCoffeeUseCase,
        { provide: CoffeeRepository, useValue: mockCoffeeRepository },
      ],
    }).compile();

    useCase = module.get<CreateCoffeeUseCase>(CreateCoffeeUseCase);
    coffeeRepository = module.get<CoffeeRepository>(CoffeeRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should create coffee linked to authenticated user', async () => {
    const dto = {
      coffee_name: 'Geisha Reserve',
      producer_farm: 'Finca La Esperanza',
      roastery: 'Roast Lab',
      origin_country: 'Colombia',
      region: 'Huila',
      altitude_meters: 1750,
      variety: 'Geisha',
      processing: {
        processing_method: 'Washed',
        fermentation_details: '48h tank fermentation',
        drying_method: 'Raised beds',
      },
      roast: {
        roast_profile: 'Light roast',
      },
      sensory_profile: {
        notes: 'Jasmine and peach',
        acidity: 'Citric',
        body: 'Silky',
        sweetness: 'High',
        finish: 'Long',
        sca_score: 89,
      },
    };

    const userId = 'user-123';
    const result = await useCase.execute(dto, userId);

    expect(result.id).toBe('coffee-id-1');
    expect(result.userId).toBe(userId);
    expect(result.coffee_name).toBe(dto.coffee_name);
    expect(result.createdAt).toBe('2026-01-01T12:00:00.000Z');
    expect(coffeeRepository.create).toHaveBeenCalledTimes(1);
  });
});
