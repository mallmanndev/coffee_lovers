import { Controller } from '@nestjs/common';
import { TsRestHandler, tsRestHandler } from '@ts-rest/nest';
import { authContract } from '@coffee-lovers/shared';
import { RegisterUserUseCase } from '../use-cases/register-user.use-case';
import { LoginUserUseCase } from '../use-cases/login-user.use-case';
import { UserResponseDto } from '../dto/user-response.dto';

@Controller()
export class UsersController {
  constructor(
    private readonly registerUserUseCase: RegisterUserUseCase,
    private readonly loginUserUseCase: LoginUserUseCase,
  ) {}

  @TsRestHandler(authContract.register)
  async register(): Promise<unknown> {
    return tsRestHandler(authContract.register, async ({ body }) => {
      const user = await this.registerUserUseCase.execute(body);
      return { status: 201 as const, body: UserResponseDto.fromEntity(user) };
    });
  }

  @TsRestHandler(authContract.login)
  async login(): Promise<unknown> {
    return tsRestHandler(authContract.login, async ({ body }) => {
      const result = await this.loginUserUseCase.execute(body);
      return { status: 200 as const, body: result };
    });
  }
}
