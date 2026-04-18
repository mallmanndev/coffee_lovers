import { Injectable, NotFoundException } from '@nestjs/common';
import { AddCoffeeToStockInput, StockItemResponse } from '@coffee-lovers/shared';
import { StockItemRepository } from '../repositories/stock-item.repository';
import { CoffeeRepository } from '../../coffees/repositories/coffee.repository';
import { StockItem } from '../domain/stock-item.entity';

@Injectable()
export class AddCoffeeToStockUseCase {
  constructor(
    private readonly stockItemRepository: StockItemRepository,
    private readonly coffeeRepository: CoffeeRepository,
  ) {}

  async execute(
    userId: string,
    input: AddCoffeeToStockInput,
  ): Promise<StockItemResponse> {
    const coffee = await this.coffeeRepository.findByIdAndUserId(
      input.coffeeId,
      userId,
    );

    if (!coffee) {
      throw new NotFoundException('Coffee not found or does not belong to user');
    }

    const stockItem = StockItem.create({
      coffeeId: input.coffeeId,
      userId,
      quantity: input.quantity,
      roastDate: new Date(input.roastDate),
      freezingDate: input.freezingDate ? new Date(input.freezingDate) : undefined,
      code: input.code,
    });

    const savedItem = await this.stockItemRepository.create(stockItem);

    return {
      id: savedItem.getId!,
      coffeeId: savedItem.getCoffeeId,
      userId: savedItem.getUserId,
      quantity: savedItem.getQuantity,
      roastDate: savedItem.getRoastDate.toISOString(),
      freezingDate: savedItem.getFreezingDate?.toISOString(),
      code: savedItem.getCode,
      createdAt: savedItem.getCreatedAt!.toISOString(),
      updatedAt: savedItem.getUpdatedAt!.toISOString(),
    };
  }
}
