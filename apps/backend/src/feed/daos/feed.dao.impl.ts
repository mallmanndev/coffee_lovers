import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, PipelineStage, Types } from 'mongoose';
import type {
  FeedCommentListResponse,
  FeedPostItem,
  FeedPostListResponse,
} from '@coffee-lovers/shared';
import { PostDocument } from '../schemas/post.schema';
import { PostCommentDocument } from '../schemas/post-comment.schema';
import { FeedDao } from './feed.dao';
import { decodeCursor, encodeCursor } from './feed-cursor.util';

type PostAggRow = {
  _id: Types.ObjectId;
  authorId: string;
  message: string;
  imageUrls: string[];
  kind: 'user' | 'equipment_share';
  userEquipamentId?: string;
  shareSummary?: string;
  createdAt: Date;
  updatedAt: Date;
  likeCount: number;
  commentCount: number;
  likedByMe: number;
  author: { _id: Types.ObjectId; name: string }[];
};

@Injectable()
export class FeedDaoImpl implements FeedDao {
  constructor(
    @InjectModel(PostDocument.name)
    private readonly postModel: Model<PostDocument>,
    @InjectModel(PostCommentDocument.name)
    private readonly commentModel: Model<PostCommentDocument>,
  ) {}

  async getPostItemById(
    postId: string,
    viewerUserId: string,
  ): Promise<FeedPostItem | null> {
    if (!Types.ObjectId.isValid(postId)) {
      return null;
    }
    const full: PipelineStage[] = [
      { $match: { _id: new Types.ObjectId(postId) } },
      ...this.postsWithMeta(viewerUserId),
      { $limit: 1 },
    ];
    const raw = await this.postModel.aggregate<PostAggRow>(full).exec();
    const row = raw[0];
    return row ? this.mapPost(row) : null;
  }

  async listPosts(
    viewerUserId: string,
    limit: number,
    cursor: string | undefined,
  ): Promise<FeedPostListResponse> {
    const take = Math.min(Math.max(1, limit), 50);
    const preMatch: Record<string, unknown> = {};
    if (cursor) {
      const c = decodeCursor(cursor);
      preMatch['$or'] = [
        { createdAt: { $lt: new Date(c.t) } },
        {
          $and: [
            { createdAt: { $eq: new Date(c.t) } },
            { _id: { $lt: new Types.ObjectId(c.i) } },
          ],
        },
      ];
    }
    const full: PipelineStage[] = [
      { $match: preMatch },
      { $sort: { createdAt: -1, _id: -1 } as Record<string, 1 | -1> },
      { $limit: take + 1 },
      ...this.postsWithMeta(viewerUserId),
    ];
    const raw = (await this.postModel
      .aggregate<PostAggRow>(full)
      .exec()) as PostAggRow[];
    const hasMore = raw.length > take;
    const page = hasMore ? raw.slice(0, take) : raw;
    const last = page[page.length - 1];
    const next =
      hasMore && last
        ? encodeCursor(last.createdAt, last._id.toString())
        : null;
    return { items: page.map((p) => this.mapPost(p)), nextCursor: next };
  }

  private postsWithMeta(viewerUserId: string): PipelineStage[] {
    return [
      {
        $lookup: {
          from: 'users',
          let: { authorStr: '$authorId' },
          pipeline: [
            {
              $match: {
                $expr: { $eq: [{ $toString: '$_id' }, '$$authorStr'] },
              },
            },
            { $project: { _id: 1, name: 1 } },
            { $limit: 1 },
          ],
          as: 'author',
        },
      },
      {
        $lookup: {
          from: 'post_likes',
          let: { pid: { $toString: '$_id' } },
          pipeline: [
            { $match: { $expr: { $eq: ['$postId', '$$pid'] } } },
            { $count: 'n' },
          ],
          as: 'likeCountArr',
        },
      },
      {
        $addFields: {
          likeCount: {
            $ifNull: [{ $arrayElemAt: ['$likeCountArr.n', 0] }, 0],
          },
        },
      },
      { $project: { likeCountArr: 0 } },
      {
        $lookup: {
          from: 'post_likes',
          let: { pid: { $toString: '$_id' } },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ['$postId', '$$pid'] },
                    { $eq: ['$userId', viewerUserId] },
                  ],
                },
              },
            },
            { $limit: 1 },
          ],
          as: 'myLike',
        },
      },
      {
        $addFields: {
          likedByMe: { $cond: [{ $gt: [{ $size: '$myLike' }, 0] }, 1, 0] },
        },
      },
      { $project: { myLike: 0 } },
      {
        $lookup: {
          from: 'post_comments',
          let: { pid: { $toString: '$_id' } },
          pipeline: [
            { $match: { $expr: { $eq: ['$postId', '$$pid'] } } },
            { $count: 'n' },
          ],
          as: 'ccArr',
        },
      },
      {
        $addFields: {
          commentCount: { $ifNull: [{ $arrayElemAt: ['$ccArr.n', 0] }, 0] },
        },
      },
      { $project: { ccArr: 0 } },
    ];
  }

  private mapPost(p: PostAggRow): FeedPostItem {
    const a = p.author[0];
    if (!a) {
      return {
        id: p._id.toString(),
        message: p.message,
        imageUrls: p.imageUrls ?? [],
        author: { id: p.authorId, name: 'Usuário' },
        likeCount: p.likeCount ?? 0,
        commentCount: p.commentCount ?? 0,
        likedByMe: (p.likedByMe ?? 0) > 0,
        kind: p.kind,
        userEquipamentId: p.userEquipamentId,
        shareSummary: p.shareSummary,
        createdAt: p.createdAt.toISOString(),
        updatedAt: p.updatedAt.toISOString(),
      };
    }
    return {
      id: p._id.toString(),
      message: p.message,
      imageUrls: p.imageUrls ?? [],
      author: { id: a._id.toString(), name: a.name },
      likeCount: p.likeCount ?? 0,
      commentCount: p.commentCount ?? 0,
      likedByMe: (p.likedByMe ?? 0) > 0,
      kind: p.kind,
      userEquipamentId: p.userEquipamentId,
      shareSummary: p.shareSummary,
      createdAt: p.createdAt.toISOString(),
      updatedAt: p.updatedAt.toISOString(),
    };
  }

  async listComments(
    postId: string,
    limit: number,
    cursor: string | undefined,
  ): Promise<FeedCommentListResponse> {
    if (!Types.ObjectId.isValid(postId)) {
      return { items: [], nextCursor: null };
    }
    const take = Math.min(Math.max(1, limit), 100);
    const preMatch: Record<string, unknown> = { postId: postId as string };
    if (cursor) {
      const c = decodeCursor(cursor);
      preMatch['$or'] = [
        { createdAt: { $gt: new Date(c.t) } },
        {
          $and: [
            { createdAt: { $eq: new Date(c.t) } },
            { _id: { $gt: new Types.ObjectId(c.i) } },
          ],
        },
      ];
    }
    const rows = (await this.commentModel
      .aggregate([
        { $match: preMatch } as unknown as PipelineStage,
        { $sort: { createdAt: 1, _id: 1 } as Record<string, 1 | -1> },
        { $limit: take + 1 },
        {
          $lookup: {
            from: 'users',
            let: { authorStr: '$authorId' },
            pipeline: [
              {
                $match: {
                  $expr: { $eq: [{ $toString: '$_id' }, '$$authorStr'] },
                },
              },
              { $project: { _id: 1, name: 1 } },
              { $limit: 1 },
            ],
            as: 'author',
          },
        },
      ])
      .exec()) as {
      _id: Types.ObjectId;
      message: string;
      authorId: string;
      createdAt: Date;
      updatedAt: Date;
      author: { _id: Types.ObjectId; name: string }[];
    }[];
    const hasMore = rows.length > take;
    const page = hasMore ? rows.slice(0, take) : rows;
    const last = page[page.length - 1];
    const next =
      hasMore && last
        ? encodeCursor(last.createdAt, last._id.toString())
        : null;
    return {
      items: page.map((r) => {
        const au = r.author[0];
        return {
          id: r._id.toString(),
          message: r.message,
          author: {
            id: au ? au._id.toString() : r.authorId,
            name: au?.name ?? 'Usuário',
          },
          createdAt: r.createdAt.toISOString(),
          updatedAt: r.updatedAt.toISOString(),
        };
      }),
      nextCursor: next,
    };
  }
}
