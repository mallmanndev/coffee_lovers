import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

@Schema({ timestamps: true, collection: 'user_equipament' })
export class UserEquipamentDocument extends Document {
  @Prop({ required: true, index: true })
  equipamentId: string;

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
  typeSpecificData: Record<string, unknown>;

  createdAt: Date;
  updatedAt: Date;
}

export const UserEquipamentSchema = SchemaFactory.createForClass(
  UserEquipamentDocument,
);
UserEquipamentSchema.index({ userId: 1, equipamentId: 1 }, { unique: true });
