import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

@Schema({ timestamps: true, collection: 'user_equipment' })
export class UserEquipmentDocument extends Document {
  @Prop({ required: true, index: true })
  equipmentId: string;

  @Prop({ required: true, index: true })
  userId: string;

  @Prop()
  description?: string;

  @Prop({
    type: [
      {
        name: { type: String, required: true },
        description: { type: String, required: true },
      },
    ],
    default: [],
  })
  modifications: { name: string; description: string }[];

  @Prop({ type: [String], default: [] })
  photos: string[];

  @Prop({ type: MongooseSchema.Types.Mixed, default: {} })
  typeSpecificData: Record<string, any>;

  createdAt: Date;
  updatedAt: Date;
}

export const UserEquipmentSchema = SchemaFactory.createForClass(UserEquipmentDocument);
UserEquipmentSchema.index({ userId: 1, equipmentId: 1 }, { unique: true });
