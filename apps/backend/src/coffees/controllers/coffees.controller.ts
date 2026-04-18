import { Controller, UseGuards } from '@nestjs/common';
import { TsRestHandler, tsRestHandler } from '@ts-rest/nest';
import { coffeeContract } from '@coffee-lovers/shared';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { CreateCoffeeUseCase } from '../use-cases/create-coffee.use-case';
import { COFFEE_DAO } from '../daos/coffee.dao';
import type { CoffeeDao } from '../daos/coffee.dao';
import { Inject } from '@nestjs/common';

@Controller()
export class CoffeesController {
  constructor(
    private readonly createCoffeeUseCase: CreateCoffeeUseCase,
    @Inject(COFFEE_DAO) private readonly coffeeDao: CoffeeDao,
  ) {}

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

  @TsRestHandler(coffeeContract.list)
  @UseGuards(JwtAuthGuard)
  async list(@CurrentUser() user: { sub: string }): Promise<unknown> {
    return tsRestHandler(coffeeContract.list, async ({ query }) => {
      const result = await this.coffeeDao.findForUser(user.sub, query.search);
      return {
        status: 200,
        body: result,
      };
    });
  }
}
