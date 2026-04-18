import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Users (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    // We assume a real Mongo instance is running or mocked via MongooseModule.forRootAsync
    // For this environment, we expect MONGODB_URI, JWT_SECRET to be present in env
    process.env.JWT_SECRET = 'test-secret';
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
  });

  afterAll(async () => {
    await app.close();
  });

  const registerDto = {
    name: 'E2E User',
    email: `e2e-${Date.now()}@example.com`,
    password: 'password123',
    confirmPassword: 'password123',
  };

  it('/accounts/register (POST)', () => {
    return request(app.getHttpServer())
      .post('/accounts/register')
      .send(registerDto)
      .expect(201)
      .expect((res) => {
        expect(res.body.email).toBe(registerDto.email);
        expect(res.body.id).toBeDefined();
        expect(res.body.password).toBeUndefined();
      });
  });

  it('/accounts/login (POST)', async () => {
    const loginDto = {
      email: registerDto.email,
      password: registerDto.password,
    };

    return request(app.getHttpServer())
      .post('/accounts/login')
      .send(loginDto)
      .expect(200)
      .expect((res) => {
        expect(res.body.accessToken).toBeDefined();
        expect(res.body.user.email).toBe(registerDto.email);
      });
  });

  it('/accounts/login (POST) - invalid credentials', () => {
    return request(app.getHttpServer())
      .post('/accounts/login')
      .send({ email: registerDto.email, password: 'wrong' })
      .expect(401);
  });
});
