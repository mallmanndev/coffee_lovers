import { Coffee } from '../domain/coffee.entity';

export abstract class CoffeeRepository {
  abstract create(coffee: Coffee): Promise<Coffee>;
}
