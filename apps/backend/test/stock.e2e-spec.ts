import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { JwtService } from '@nestjs/jwt';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CoffeeDocument } from '../src/coffees/schemas/coffee.schema';
import { StockItemDocument } from '../src/stock/schemas/stock-item.schema';

describe('Stock (e2e)', () => {
  let app: INestApplication;
  let jwtService: JwtService;
  let coffeeModel: Model<CoffeeDocument>;
  let stockItemModel: Model<StockItemDocument>;

  const userId = '60d0fe4f5311236168a109ca';
  let token: string;
  let existingCoffeeId: string;

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
    stockItemModel = moduleFixture.get<Model<StockItemDocument>>(
      getModelToken(StockItemDocument.name),
    );

    token = jwtService.sign({
      sub: userId,
      email: 'stock@test.com',
      name: 'Stock User',
    });
  });

  beforeEach(async () => {
    await coffeeModel.deleteMany({});
    await stockItemModel.deleteMany({});

    const coffee = await coffeeModel.create({
      coffee_name: 'Test Coffee',
      roastery: 'Test Roastery',
      userId: userId,
    });
    existingCoffeeId = coffee._id.toString();
  });

  afterAll(async () => {
    await app.close();
  });

  it('POST /stock should add coffee to stock when authenticated and coffee exists', async () => {
    const payload = {
      coffeeId: existingCoffeeId,
      quantity: 0.25,
      roastDate: new Date().toISOString(),
      code: 'LOT-123',
    };

    const res = await request(app.getHttpServer())
      .post('/stock')
      .set('Authorization', `Bearer ${token}`)
      .send(payload);

    expect(res.status).toBe(201);
    expect(res.body.id).toBeDefined();
    expect(res.body.coffeeId).toBe(existingCoffeeId);
    expect(res.body.userId).toBe(userId);
    expect(res.body.quantity).toBe(payload.quantity);
    expect(res.body.code).toBe(payload.code);

    const inDb = await stockItemModel.findOne({
      coffeeId: existingCoffeeId,
      userId,
    });
    expect(inDb).toBeTruthy();
    expect(inDb?.code).toBe(payload.code);
  });

  it('POST /stock should return 404 if coffee does not exist', async () => {
    const payload = {
      coffeeId: '60d0fe4f5311236168a109cb', // non-existent
      quantity: 0.25,
      roastDate: new Date().toISOString(),
      code: 'LOT-123',
    };

    const res = await request(app.getHttpServer())
      .post('/stock')
      .set('Authorization', `Bearer ${token}`)
      .send(payload);

    expect(res.status).toBe(404);
  });

  it('POST /stock should return 401 if not authenticated', async () => {
    const payload = {
      coffeeId: existingCoffeeId,
      quantity: 0.25,
      roastDate: new Date().toISOString(),
      code: 'LOT-123',
    };

    const res = await request(app.getHttpServer())
      .post('/stock')
      .send(payload);

    expect(res.status).toBe(401);
  });
});
