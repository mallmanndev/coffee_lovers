import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CoffeeDocument } from '../schemas/coffee.schema';
import { CoffeeDao, CoffeeListItemDto } from './coffee.dao';

@Injectable()
export class CoffeeDaoImpl implements CoffeeDao {
  constructor(
    @InjectModel(CoffeeDocument.name)
    private readonly coffeeModel: Model<CoffeeDocument>,
  ) {}

  async findForUser(userId: string, search?: string): Promise<CoffeeListItemDto[]> {
    const query: any = { userId };

    if (search) {
      const searchRegex = new RegExp(search, 'i');
      query.$or = [
        { coffee_name: searchRegex },
        { producer_farm: searchRegex },
        { roastery: searchRegex },
      ];
    }

    const docs = await this.coffeeModel.find(query).sort({ createdAt: -1 }).exec();

    return docs.map((doc) => {
      const obj = doc.toObject();
      return {
        ...obj,
        id: obj._id.toString(),
        createdAt: obj.createdAt.toISOString(),
        updatedAt: obj.updatedAt.toISOString(),
      };
    }) as unknown as CoffeeListItemDto[];
  }
}
