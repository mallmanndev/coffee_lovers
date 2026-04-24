import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Post } from '../domain/post.entity';
import { PostDocument } from '../schemas/post.schema';
import { PostRepository } from './post.repository';

@Injectable()
export class MongoosePostRepository implements PostRepository {
  constructor(
    @InjectModel(PostDocument.name)
    private readonly postModel: Model<PostDocument>,
  ) {}

  async create(post: Post): Promise<Post> {
    const created = new this.postModel({
      authorId: post.getAuthorId(),
      message: post.getMessage(),
      imageUrls: post.getImageUrls(),
      kind: post.getKind(),
      userEquipamentId: post.getUserEquipamentId() ?? undefined,
      shareSummary: post.getShareSummary() ?? undefined,
    });
    const doc = await created.save();
    return this.mapToEntity(doc);
  }

  async findById(id: string): Promise<Post | null> {
    if (!Types.ObjectId.isValid(id)) {
      return null;
    }
    const doc = await this.postModel.findById(id).exec();
    return doc ? this.mapToEntity(doc) : null;
  }

  async findByIdAndAuthorId(
    id: string,
    authorId: string,
  ): Promise<Post | null> {
    if (!Types.ObjectId.isValid(id)) {
      return null;
    }
    const doc = await this.postModel
      .findOne({ _id: id, authorId } as any)
      .exec();
    return doc ? this.mapToEntity(doc) : null;
  }

  async update(post: Post): Promise<Post> {
    const id = post.getId();
    if (!id || !Types.ObjectId.isValid(id)) {
      throw new Error('invalid post id for update');
    }
    const kind = post.getKind();
    const $set: Record<string, unknown> = {
      message: post.getMessage(),
      imageUrls: post.getImageUrls(),
    };
    if (kind === 'equipment_share') {
      $set.shareSummary = post.getShareSummary() || undefined;
    }
    const update: Record<string, unknown> = { $set };
    if (kind === 'user') {
      update.$unset = { shareSummary: '' };
    }
    const doc = await this.postModel
      .findByIdAndUpdate(id, update, { new: true })
      .exec();
    if (!doc) {
      throw new Error('post not found after update');
    }
    return this.mapToEntity(doc);
  }

  async deleteById(id: string): Promise<void> {
    if (!Types.ObjectId.isValid(id)) {
      return;
    }
    await this.postModel.deleteOne({ _id: id } as any).exec();
  }

  private mapToEntity(doc: PostDocument): Post {
    return Post.create({
      id: doc._id.toString(),
      authorId: doc.authorId,
      message: doc.message,
      imageUrls: doc.imageUrls ?? [],
      kind: doc.kind,
      userEquipamentId: doc.userEquipamentId,
      shareSummary: doc.shareSummary,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    });
  }
}
