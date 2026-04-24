import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { PostComment } from '../domain/post-comment.entity';
import { PostCommentDocument } from '../schemas/post-comment.schema';
import { PostCommentRepository } from './post-comment.repository';

@Injectable()
export class MongoosePostCommentRepository implements PostCommentRepository {
  constructor(
    @InjectModel(PostCommentDocument.name)
    private readonly model: Model<PostCommentDocument>,
  ) {}

  async create(comment: PostComment): Promise<PostComment> {
    const created = new this.model({
      postId: comment.getPostId(),
      authorId: comment.getAuthorId(),
      message: comment.getMessage(),
    });
    const doc = await created.save();
    return this.mapToEntity(doc);
  }

  async findById(id: string): Promise<PostComment | null> {
    if (!Types.ObjectId.isValid(id)) {
      return null;
    }
    const doc = await this.model.findById(id).exec();
    return doc ? this.mapToEntity(doc) : null;
  }

  async findByIdAndAuthorId(
    id: string,
    authorId: string,
  ): Promise<PostComment | null> {
    if (!Types.ObjectId.isValid(id)) {
      return null;
    }
    const doc = await this.model
      .findOne({ _id: id, authorId } as any)
      .exec();
    return doc ? this.mapToEntity(doc) : null;
  }

  async countByPostIds(postIds: string[]): Promise<Map<string, number>> {
    if (postIds.length === 0) {
      return new Map();
    }
    const agg = await this.model
      .aggregate<{ _id: string; c: number }>([
        { $match: { postId: { $in: postIds } } },
        { $group: { _id: '$postId', c: { $sum: 1 } } },
      ])
      .exec();
    const m = new Map<string, number>();
    for (const r of agg) {
      m.set(r._id, r.c);
    }
    return m;
  }

  async deleteByPostId(postId: string): Promise<void> {
    await this.model.deleteMany({ postId }).exec();
  }

  async deleteById(id: string): Promise<void> {
    if (!Types.ObjectId.isValid(id)) {
      return;
    }
    await this.model.deleteOne({ _id: id } as any).exec();
  }

  private mapToEntity(doc: PostCommentDocument): PostComment {
    return PostComment.create({
      id: doc._id.toString(),
      postId: doc.postId,
      authorId: doc.authorId,
      message: doc.message,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    });
  }
}
