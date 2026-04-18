import { CanActivate, ExecutionContext, INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { TsRestModule } from '@ts-rest/nest';
import request from 'supertest';
import { StockController } from './stock.controller';
import { AddCoffeeToStockUseCase } from '../use-cases/add-coffee-to-stock.use-case';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';

class FakeJwtAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    request.user = { sub: 'user-1' };
    return true;
  }
}

describe('StockController', () => {
  let app: INestApplication;
  let addCoffeeToStockUseCase: jest.Mocked<AddCoffeeToStockUseCase>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [TsRestModule.register({ isGlobal: true })],
      controllers: [StockController],
      providers: [
        {
          provide: AddCoffeeToStockUseCase,
          useValue: {
            execute: jest.fn(),
          },
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useClass(FakeJwtAuthGuard)
      .compile();

    app = module.createNestApplication();
    await app.init();

    addCoffeeToStockUseCase = module.get(AddCoffeeToStockUseCase);
  });

  afterEach(async () => {
    jest.clearAllMocks();
    await app.close();
  });

  it('should be defined', () => {
    expect(app).toBeDefined();
  });

  describe('POST /stock', () => {
    it('should call AddCoffeeToStockUseCase and return 201', async () => {
      const body = {
        coffeeId: 'coffee-1',
        quantity: 1,
        roastDate: new Date().toISOString(),
        code: 'CODE123',
      };
      const expectedResponse = { 
        id: 'stock-1', 
        ...body, 
        createdAt: new Date().toISOString(), 
        updatedAt: new Date().toISOString(), 
        userId: 'user-1' 
      };

      addCoffeeToStockUseCase.execute.mockResolvedValue(expectedResponse as any);

      const response = await request(app.getHttpServer())
        .post('/stock')
        .send(body);
      
      expect(addCoffeeToStockUseCase.execute).toHaveBeenCalledWith('user-1', body);
      expect(response.status).toBe(201);
      expect(response.body).toEqual(expectedResponse);
    });
  });
});
