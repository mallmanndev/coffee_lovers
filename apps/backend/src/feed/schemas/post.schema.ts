import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Schema as MongooseSchema } from 'mongoose';

/**
 * Campos `kind`, `userEquipamentId` e `shareSummary` suportam posts do tipo
 * "compartilhou um equipamento novo" quando integrados a
 * `CreateUserEquipamentUseCase` (a implementar no produto: modal pós-cadastro).
 * Use `CreatePostFromUserEquipamentUseCase` (stub em use-cases) para orquestrar.
 */
@Schema({ timestamps: true, collection: 'posts' })
export class PostDocument {
  _id!: MongooseSchema.Types.ObjectId;

  @Prop({ required: true })
  authorId!: string;

  @Prop({ required: true })
  message!: string;

  @Prop({ type: [String], default: [] })
  imageUrls!: string[];

  @Prop({ type: String, required: true, default: 'user' })
  kind!: 'user' | 'equipment_share';

  @Prop()
  userEquipamentId?: string;

  @Prop()
  shareSummary?: string;

  createdAt!: Date;
  updatedAt!: Date;
}

export const PostSchema: MongooseSchema = SchemaFactory.createForClass(
  PostDocument,
);

PostSchema.index({ createdAt: -1, _id: -1 });
PostSchema.index({ authorId: 1 });
