import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TsRestModule } from '@ts-rest/nest';
import { CoffeesController } from './controllers/coffees.controller';
import { CreateCoffeeUseCase } from './use-cases/create-coffee.use-case';
import { CoffeeRepository } from './repositories/coffee.repository';
import { MongooseCoffeeRepository } from './repositories/coffee.repository.impl';
import { CoffeeDocument, CoffeeSchema } from './schemas/coffee.schema';
import { COFFEE_DAO } from './daos/coffee.dao';
import { CoffeeDaoImpl } from './daos/coffee.dao.impl';

@Module({
  imports: [
    TsRestModule.register({}),
    MongooseModule.forFeature([
      { name: CoffeeDocument.name, schema: CoffeeSchema },
    ]),
  ],
  controllers: [CoffeesController],
  providers: [
    CreateCoffeeUseCase,
    {
      provide: CoffeeRepository,
      useClass: MongooseCoffeeRepository,
    },
    {
      provide: COFFEE_DAO,
      useClass: CoffeeDaoImpl,
    },
  ],
  exports: [CoffeeRepository, COFFEE_DAO],
})
export class CoffeesModule {}
