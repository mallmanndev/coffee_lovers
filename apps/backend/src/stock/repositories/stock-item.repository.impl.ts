import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { StockItem } from '../domain/stock-item.entity';
import { StockItemDocument } from '../schemas/stock-item.schema';
import { StockItemRepository } from './stock-item.repository';

@Injectable()
export class MongooseStockItemRepository implements StockItemRepository {
  constructor(
    @InjectModel(StockItemDocument.name)
    private readonly model: Model<StockItemDocument>,
  ) {}

  async create(item: StockItem): Promise<StockItem> {
    const created = await this.model.create({
      coffeeId: item.getCoffeeId,
      userId: item.getUserId,
      quantity: item.getQuantity,
      roastDate: item.getRoastDate,
      freezingDate: item.getFreezingDate ?? undefined,
      code: item.getCode,
    });

    return this.mapToEntity(created);
  }

  private mapToEntity(doc: StockItemDocument): StockItem {
    return StockItem.create({
      id: doc._id.toString(),
      coffeeId: doc.coffeeId,
      userId: doc.userId,
      quantity: doc.quantity,
      roastDate: doc.roastDate,
      freezingDate: doc.freezingDate,
      code: doc.code,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    });
  }
}
