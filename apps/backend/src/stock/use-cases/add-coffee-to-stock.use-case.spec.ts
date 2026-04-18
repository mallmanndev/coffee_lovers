import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { AddCoffeeToStockUseCase } from './add-coffee-to-stock.use-case';
import { StockItemRepository } from '../repositories/stock-item.repository';
import { CoffeeRepository } from '../../coffees/repositories/coffee.repository';
import { StockItem } from '../domain/stock-item.entity';

describe('AddCoffeeToStockUseCase', () => {
  let useCase: AddCoffeeToStockUseCase;
  let stockItemRepository: StockItemRepository;
  let coffeeRepository: CoffeeRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AddCoffeeToStockUseCase,
        {
          provide: StockItemRepository,
          useValue: {
            create: jest.fn(),
          },
        },
        {
          provide: CoffeeRepository,
          useValue: {
            findByIdAndUserId: jest.fn(),
          },
        },
      ],
    }).compile();

    useCase = module.get<AddCoffeeToStockUseCase>(AddCoffeeToStockUseCase);
    stockItemRepository = module.get<StockItemRepository>(StockItemRepository);
    coffeeRepository = module.get<CoffeeRepository>(CoffeeRepository);
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  it('should throw NotFoundException if coffee does not exist', async () => {
    jest.spyOn(coffeeRepository, 'findByIdAndUserId').mockResolvedValue(null);

    await expect(
      useCase.execute('user-1', {
        coffeeId: 'coffee-1',
        quantity: 1,
        roastDate: new Date().toISOString(),
        code: 'CODE123',
      }),
    ).rejects.toThrow(NotFoundException);
  });

  it('should create and return a stock item if coffee exists', async () => {
    const mockCoffee = { id: 'coffee-1', userId: 'user-1' } as any;
    jest.spyOn(coffeeRepository, 'findByIdAndUserId').mockResolvedValue(mockCoffee);

    const now = new Date();
    const mockSavedItem = StockItem.create({
      id: 'stock-1',
      coffeeId: 'coffee-1',
      userId: 'user-1',
      quantity: 1,
      roastDate: now,
      code: 'CODE123',
      createdAt: now,
      updatedAt: now,
    });

    jest.spyOn(stockItemRepository, 'create').mockResolvedValue(mockSavedItem);

    const result = await useCase.execute('user-1', {
      coffeeId: 'coffee-1',
      quantity: 1,
      roastDate: now.toISOString(),
      code: 'CODE123',
    });

    expect(result).toBeDefined();
    expect(result.id).toBe('stock-1');
    expect(result.coffeeId).toBe('coffee-1');
    expect(stockItemRepository.create).toHaveBeenCalled();
  });
});
