import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { JwtService } from '@nestjs/jwt';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CoffeeDocument } from '../src/coffees/schemas/coffee.schema';

describe('Coffees (e2e)', () => {
  let app: INestApplication;
  let jwtService: JwtService;
  let coffeeModel: Model<CoffeeDocument>;

  const userId = '60d0fe4f5311236168a109ca';

  const payload = {
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

  beforeAll(async () => {
    process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-secret';
    process.env.MONGODB_URI =
      process.env.MONGODB_URI || 'mongodb://localhost:27017/coffee_lovers_test';

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    await app.init();

    jwtService = moduleFixture.get<JwtService>(JwtService);
    coffeeModel = moduleFixture.get<Model<CoffeeDocument>>(
      getModelToken(CoffeeDocument.name),
    );
  });

  beforeEach(async () => {
    await coffeeModel.deleteMany({});
  });

  afterAll(async () => {
    await app.close();
  });

  it('POST /coffee should create a coffee when authenticated', async () => {
    const token = jwtService.sign({
      sub: userId,
      email: 'coffee@test.com',
      name: 'Coffee User',
    });

    const res = await request(app.getHttpServer())
      .post('/coffee')
      .set('Authorization', `Bearer ${token}`)
      .send(payload);

    expect(res.status).toBe(201);
    expect(res.body.id).toBeDefined();
    expect(res.body.userId).toBe(userId);
    expect(res.body.coffee_name).toBe(payload.coffee_name);
    expect(res.body.createdAt).toBeDefined();
    expect(res.body.updatedAt).toBeDefined();

    const inDb = await coffeeModel.findOne({
      coffee_name: payload.coffee_name,
      userId,
    });
    expect(inDb).toBeTruthy();
  });

  it('POST /coffee should return 401 without token', async () => {
    const res = await request(app.getHttpServer())
      .post('/coffee')
      .send(payload);

    expect(res.status).toBe(401);
  });
});
