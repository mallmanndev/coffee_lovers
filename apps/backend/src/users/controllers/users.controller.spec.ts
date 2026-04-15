import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { RegisterUserUseCase } from '../use-cases/register-user.use-case';
import { LoginUserUseCase } from '../use-cases/login-user.use-case';
import { User } from '../domain/user.entity';

describe('UsersController', () => {
  let controller: UsersController;
  let registerUseCase: jest.Mocked<RegisterUserUseCase>;
  let loginUseCase: jest.Mocked<LoginUserUseCase>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
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

    controller = module.get<UsersController>(UsersController);
    registerUseCase = module.get(RegisterUserUseCase);
    loginUseCase = module.get(LoginUserUseCase);
  });

  it('should call register use case with dto', async () => {
    const dto = { name: 'John', email: 'john@example.com', password: '123', confirmPassword: '123' };
    const user = User.create({ ...dto, passwordHash: 'hash' });
    registerUseCase.execute.mockResolvedValue(user);

    const result = await controller.register(dto);

    expect(registerUseCase.execute).toHaveBeenCalledWith(dto);
    expect(result.email).toBe(dto.email);
  });

  it('should call login use case with dto', async () => {
    const dto = { email: 'john@example.com', password: '123' };
    const response = { user: { id: '1', name: 'John', email: 'john@example.com', createdAt: 'date' }, accessToken: 'token' };
    loginUseCase.execute.mockResolvedValue(response);

    const result = await controller.login(dto);

    expect(loginUseCase.execute).toHaveBeenCalledWith(dto);
    expect(result).toEqual(response);
  });
});
