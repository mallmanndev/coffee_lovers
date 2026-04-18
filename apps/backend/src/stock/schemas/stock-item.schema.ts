import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Schema as MongooseSchema } from 'mongoose';

@Schema({ timestamps: true, collection: 'stock_items' })
export class StockItemDocument {
  _id: MongooseSchema.Types.ObjectId;

  @Prop({ required: true, index: true })
  coffeeId: string;

  @Prop({ required: true, index: true })
  userId: string;

  @Prop({ required: true })
  quantity: number;

  @Prop({ required: true })
  roastDate: Date;

  @Prop({ required: false })
  freezingDate?: Date;

  @Prop({ required: true })
  code: string;

  createdAt: Date;
  updatedAt: Date;
}

export const StockItemSchema: MongooseSchema =
  SchemaFactory.createForClass(StockItemDocument);
