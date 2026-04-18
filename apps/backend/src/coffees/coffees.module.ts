import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TsRestModule } from '@ts-rest/nest';
import { CoffeesController } from './controllers/coffees.controller';
import { CreateCoffeeUseCase } from './use-cases/create-coffee.use-case';
import { CoffeeRepository } from './repositories/coffee.repository';
import { MongooseCoffeeRepository } from './repositories/coffee.repository.impl';
import { CoffeeDocument, CoffeeSchema } from './schemas/coffee.schema';

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
  ],
  exports: [CoffeeRepository],
})
export class CoffeesModule {}
