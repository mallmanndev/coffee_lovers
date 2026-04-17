import { Controller, UseGuards } from '@nestjs/common';
import { TsRestHandler, tsRestHandler } from '@ts-rest/nest';
import { coffeeContract } from '@coffee-lovers/shared';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { CreateCoffeeUseCase } from '../use-cases/create-coffee.use-case';

@Controller()
export class CoffeesController {
  constructor(private readonly createCoffeeUseCase: CreateCoffeeUseCase) {}

  @TsRestHandler(coffeeContract.create)
  @UseGuards(JwtAuthGuard)
  async create(@CurrentUser() user: { sub: string }): Promise<unknown> {
    return tsRestHandler(coffeeContract.create, async ({ body }) => {
      const result = await this.createCoffeeUseCase.execute(body, user.sub);
      return {
        status: 201,
        body: result,
      };
    });
  }
}
