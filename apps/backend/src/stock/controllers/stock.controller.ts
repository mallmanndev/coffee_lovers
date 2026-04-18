import { Controller, UseGuards } from '@nestjs/common';
import { TsRestHandler, tsRestHandler } from '@ts-rest/nest';
import { stockContract } from '@coffee-lovers/shared';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { AddCoffeeToStockUseCase } from '../use-cases/add-coffee-to-stock.use-case';

@Controller()
export class StockController {
  constructor(private readonly addCoffeeToStockUseCase: AddCoffeeToStockUseCase) {}

  @TsRestHandler(stockContract.add)
  @UseGuards(JwtAuthGuard)
  async add(@CurrentUser() user: { sub: string }): Promise<unknown> {
    return tsRestHandler(stockContract.add, async ({ body }) => {
      const result = await this.addCoffeeToStockUseCase.execute(user.sub, body);
      return {
        status: 201,
        body: result,
      };
    });
  }
}
