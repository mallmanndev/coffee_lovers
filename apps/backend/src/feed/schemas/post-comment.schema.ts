import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Schema as MongooseSchema } from 'mongoose';

@Schema({ timestamps: true, collection: 'post_comments' })
export class PostCommentDocument {
  _id!: MongooseSchema.Types.ObjectId;

  @Prop({ required: true })
  postId!: string;

  @Prop({ required: true })
  authorId!: string;

  @Prop({ required: true })
  message!: string;

  createdAt!: Date;
  updatedAt!: Date;
}

export const PostCommentSchema: MongooseSchema = SchemaFactory.createForClass(
  PostCommentDocument,
);

PostCommentSchema.index({ postId: 1, createdAt: 1, _id: 1 });
