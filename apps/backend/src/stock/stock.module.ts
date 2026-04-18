import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TsRestModule } from '@ts-rest/nest';
import { StockController } from './controllers/stock.controller';
import { AddCoffeeToStockUseCase } from './use-cases/add-coffee-to-stock.use-case';
import { StockItemRepository } from './repositories/stock-item.repository';
import { MongooseStockItemRepository } from './repositories/stock-item.repository.impl';
import { StockItemDocument, StockItemSchema } from './schemas/stock-item.schema';
import { CoffeesModule } from '../coffees/coffees.module';

@Module({
  imports: [
    TsRestModule.register({}),
    MongooseModule.forFeature([
      { name: StockItemDocument.name, schema: StockItemSchema },
    ]),
    CoffeesModule,
  ],
  controllers: [StockController],
  providers: [
    AddCoffeeToStockUseCase,
    {
      provide: StockItemRepository,
      useClass: MongooseStockItemRepository,
    },
  ],
})
export class StockModule {}
