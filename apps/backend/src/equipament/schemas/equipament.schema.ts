import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

@Schema({ timestamps: true, collection: 'equipament' })
export class EquipamentDocument {
  _id: MongooseSchema.Types.ObjectId;
  
  @Prop({ required: true, index: true })
  type: string;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  model: string;

  @Prop({ required: true })
  brand: string;

  @Prop()
  description?: string;

  @Prop({ type: [String], default: [] })
  photos: string[];

  @Prop({ required: true, index: true })
  createdById: string;

  @Prop({ type: MongooseSchema.Types.Mixed, default: {} })
  typeSpecificData: Record<string, any>;

  createdAt: Date;
  updatedAt: Date;
}

export const EquipamentSchema: MongooseSchema = SchemaFactory.createForClass(EquipamentDocument);
