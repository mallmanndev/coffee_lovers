export interface Coffee {
  id: string;
  name: string;
  roaster: string;
  origin: string;
  process: string;
  notes: string[];
  rating: number;
}

export type CreateCoffeeDto = Omit<Coffee, 'id'>;
