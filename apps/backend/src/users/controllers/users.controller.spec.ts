import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { TsRestModule } from '@ts-rest/nest';
import { UsersController } from './users.controller';
import { RegisterUserUseCase } from '../use-cases/register-user.use-case';
import { LoginUserUseCase } from '../use-cases/login-user.use-case';
import { User } from '../domain/user.entity';
import { ConflictException } from '@nestjs/common';

describe('UsersController', () => {
  let app: INestApplication;
  let registerUseCase: jest.Mocked<RegisterUserUseCase>;
  let loginUseCase: jest.Mocked<LoginUserUseCase>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [TsRestModule.register({ isGlobal: true })],
      controllers: [UsersController],
      providers: [
        {
          provide: RegisterUserUseCase,
          useValue: { execute: jest.fn() },
        },
        {
          provide: LoginUserUseCase,
          useValue: { execute: jest.fn() },
        },
      ],
    }).compile();

    app = module.createNestApplication();
    await app.init();

    registerUseCase = module.get(RegisterUserUseCase);
    loginUseCase = module.get(LoginUserUseCase);
  });

  afterEach(async () => {
    await app.close();
  });

  it('POST /accounts/register calls register use case and returns 201', async () => {
    const dto = {
      name: 'John',
      email: 'john@example.com',
      password: '123456',
      confirmPassword: '123456',
      city: 'Florianópolis',
      state: 'SC',
    };
    const user = User.create({
      name: dto.name,
      email: dto.email,
      passwordHash: 'hash',
      city: dto.city,
      state: dto.state,
    });
    registerUseCase.execute.mockResolvedValue(user);

    const res = await request(app.getHttpServer())
      .post('/accounts/register')
      .send(dto);

    expect(registerUseCase.execute).toHaveBeenCalledWith(dto);
    expect(res.status).toBe(201);
    expect(res.body.email).toBe(dto.email);
  });

  it('POST /accounts/register returns 409 if email already exists', async () => {
    const dto = {
      name: 'John',
      email: 'john@example.com',
      password: '123456',
      confirmPassword: '123456',
      city: 'Florianópolis',
      state: 'SC',
    };
    registerUseCase.execute.mockRejectedValue(
      new ConflictException('E-mail já está em uso'),
    );

    const res = await request(app.getHttpServer())
      .post('/accounts/register')
      .send(dto);

    expect(registerUseCase.execute).toHaveBeenCalledWith(dto);
    expect(res.status).toBe(409);
    expect(res.body.message).toBe('E-mail já está em uso');
  });

  it('POST /accounts/login calls login use case and returns 200', async () => {
    const dto = { email: 'john@example.com', password: '123456' };
    const response = {
      user: {
        id: '1',
        name: 'John',
        email: 'john@example.com',
        city: 'Florianópolis',
        state: 'SC',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      accessToken: 'token',
    };
    loginUseCase.execute.mockResolvedValue(response);

    const res = await request(app.getHttpServer())
      .post('/accounts/login')
      .send(dto);

    expect(loginUseCase.execute).toHaveBeenCalledWith(dto);
    expect(res.status).toBe(200);
    expect(res.body.accessToken).toBe('token');
  });
});
