import { CanActivate, ExecutionContext, INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { TsRestModule } from '@ts-rest/nest';
import request from 'supertest';
import type {
  CoffeeListItemDto,
  CoffeeDao,
} from '../daos/coffee.dao';
import { COFFEE_DAO } from '../daos/coffee.dao';
import { CoffeesController } from './coffees.controller';
import { CreateCoffeeUseCase } from '../use-cases/create-coffee.use-case';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';

class FakeJwtAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    request.user = { sub: 'user-1' };
    return true;
  }
}

describe('CoffeesController', () => {
  let app: INestApplication;
  let createCoffeeUseCase: jest.Mocked<CreateCoffeeUseCase>;
  let coffeeDao: jest.Mocked<CoffeeDao>;

  beforeEach(async () => {
    const moduleBuilder = Test.createTestingModule({
      imports: [TsRestModule.register({ isGlobal: true })],
      controllers: [CoffeesController],
      providers: [
        {
          provide: CreateCoffeeUseCase,
          useValue: { execute: jest.fn() },
        },
        {
          provide: COFFEE_DAO,
          useValue: { findForUser: jest.fn() },
        },
      ],
    });

    const module: TestingModule = await moduleBuilder
      .overrideGuard(JwtAuthGuard)
      .useClass(FakeJwtAuthGuard)
      .compile();

    app = module.createNestApplication();
    await app.init();

    createCoffeeUseCase = module.get(CreateCoffeeUseCase);
    coffeeDao = module.get(COFFEE_DAO);
  });

  afterEach(async () => {
    jest.clearAllMocks();
    await app.close();
  });

  it('POST /coffee calls create use case and returns 201', async () => {
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

    const createdCoffee: CoffeeListItemDto = {
      id: 'coffee-id-1',
      userId: 'user-1',
      createdAt: '2026-01-01T12:00:00.000Z',
      updatedAt: '2026-01-01T12:00:00.000Z',
      ...dto,
    };

    createCoffeeUseCase.execute.mockResolvedValue(createdCoffee);

    const response = await request(app.getHttpServer())
      .post('/coffee')
      .set('Authorization', 'Bearer test-token')
      .send(dto);

    expect(createCoffeeUseCase.execute).toHaveBeenCalledWith(dto, 'user-1');
    expect(response.status).toBe(201);
    expect(response.body).toEqual(createdCoffee);
  });

  it('GET /coffee calls dao and returns 200', async () => {
    const coffees: CoffeeListItemDto[] = [
      {
        id: 'coffee-id-1',
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
        userId: 'user-1',
        createdAt: '2026-01-01T12:00:00.000Z',
        updatedAt: '2026-01-01T12:00:00.000Z',
      },
    ];

    coffeeDao.findForUser.mockResolvedValue(coffees);

    const response = await request(app.getHttpServer())
      .get('/coffee')
      .set('Authorization', 'Bearer test-token')
      .query({ search: 'geisha' });

    expect(coffeeDao.findForUser).toHaveBeenCalledWith('user-1', 'geisha');
    expect(response.status).toBe(200);
    expect(response.body).toEqual(coffees);
  });
});