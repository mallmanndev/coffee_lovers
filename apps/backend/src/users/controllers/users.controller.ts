import { Controller, UseGuards } from '@nestjs/common';
import { TsRestHandler, tsRestHandler } from '@ts-rest/nest';
import { authContract } from '@coffee-lovers/shared';
import { RegisterUserUseCase } from '../use-cases/register-user.use-case';
import { LoginUserUseCase } from '../use-cases/login-user.use-case';
import { GetUserProfileUseCase } from '../use-cases/get-user-profile.use-case';
import { UserResponseDto } from '../dto/user-response.dto';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';

@Controller()
export class UsersController {
  constructor(
    private readonly registerUserUseCase: RegisterUserUseCase,
    private readonly loginUserUseCase: LoginUserUseCase,
    private readonly getUserProfileUseCase: GetUserProfileUseCase,
  ) {}

  @TsRestHandler(authContract.register)
  async register(): Promise<unknown> {
    return tsRestHandler(authContract.register, async ({ body }) => {
      try {
        const user = await this.registerUserUseCase.execute(body);
        return { status: 201 as const, body: UserResponseDto.fromEntity(user) };
      } catch (error) {
        if (error instanceof ConflictException) {
          return { status: 409 as const, body: { message: error.message } };
        }
        throw error;
      }
    });
  }

  @TsRestHandler(authContract.login)
  async login(): Promise<unknown> {
    return tsRestHandler(authContract.login, async ({ body }) => {
      const result = await this.loginUserUseCase.execute(body);
      return { status: 200 as const, body: result };
    });
  }

  @TsRestHandler(authContract.getProfile)
  @UseGuards(JwtAuthGuard)
  async getProfile(): Promise<unknown> {
    return tsRestHandler(authContract.getProfile, async ({ params }) => {
      try {
        const user = await this.getUserProfileUseCase.execute(params.id);
        return { status: 200 as const, body: UserResponseDto.fromEntity(user) };
      } catch (error) {
        if (error instanceof NotFoundException) {
          return { status: 404 as const, body: { message: error.message } };
        }
        throw error;
      }
    });
  }
}
