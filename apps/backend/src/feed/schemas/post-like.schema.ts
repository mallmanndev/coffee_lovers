import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Schema as MongooseSchema } from 'mongoose';

@Schema({ timestamps: true, collection: 'post_likes' })
export class PostLikeDocument {
  _id!: MongooseSchema.Types.ObjectId;

  @Prop({ required: true })
  userId!: string;

  @Prop({ required: true })
  postId!: string;

  createdAt!: Date;
  updatedAt!: Date;
}

export const PostLikeSchema: MongooseSchema = SchemaFactory.createForClass(
  PostLikeDocument,
);

PostLikeSchema.index({ userId: 1, postId: 1 }, { unique: true });
PostLikeSchema.index({ postId: 1 });
