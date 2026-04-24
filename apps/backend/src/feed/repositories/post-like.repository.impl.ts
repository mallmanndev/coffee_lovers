import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { PostLikeDocument } from '../schemas/post-like.schema';
import { PostLikeRecord } from './post-like.types';
import { PostLikeRepository } from './post-like.repository';

@Injectable()
export class MongoosePostLikeRepository implements PostLikeRepository {
  constructor(
    @InjectModel(PostLikeDocument.name)
    private readonly likeModel: Model<PostLikeDocument>,
  ) {}

  async addLike(userId: string, postId: string): Promise<PostLikeRecord | null> {
    try {
      const created = await this.likeModel.create({
        userId,
        postId,
      });
      return {
        id: created._id.toString(),
        userId: created.userId,
        postId: created.postId,
        createdAt: created.createdAt,
      };
    } catch (err: unknown) {
      const isDup = (() => {
        if (err && typeof err === 'object' && 'code' in err) {
          return (err as { code?: number }).code === 11000;
        }
        return false;
      })();
      if (isDup) {
        return null;
      }
      throw err;
    }
  }

  async removeLike(userId: string, postId: string): Promise<boolean> {
    const r = await this.likeModel.deleteOne({ userId, postId }).exec();
    return (r.deletedCount ?? 0) > 0;
  }

  async countByPostIds(postIds: string[]): Promise<Map<string, number>> {
    if (postIds.length === 0) {
      return new Map();
    }
    const agg = await this.likeModel
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

  async hasLike(userId: string, postId: string): Promise<boolean> {
    const d = await this.likeModel.findOne({ userId, postId }).lean().exec();
    return !!d;
  }

  async deleteByPostId(postId: string): Promise<void> {
    await this.likeModel.deleteMany({ postId: postId }).exec();
  }
}
