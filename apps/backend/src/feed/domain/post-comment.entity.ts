import { BadRequestException } from '@nestjs/common';

const maxCommentLength = 2000;

export type PostCommentProps = {
  id?: string;
  postId: string;
  authorId: string;
  message: string;
  createdAt?: Date;
  updatedAt?: Date;
};

export class PostComment {
  private constructor(
    private readonly id: string | null,
    private readonly postId: string,
    private readonly authorId: string,
    private readonly message: string,
    private readonly createdAt: Date,
    private readonly updatedAt: Date,
  ) {}

  static create(props: PostCommentProps): PostComment {
    if (typeof props.postId !== 'string' || !props.postId.trim()) {
      throw new BadRequestException('postId is required');
    }
    if (typeof props.authorId !== 'string' || !props.authorId.trim()) {
      throw new BadRequestException('authorId is required');
    }
    if (typeof props.message !== 'string') {
      throw new BadRequestException('message is required');
    }
    const t = props.message.trim();
    if (t.length === 0) {
      throw new BadRequestException('message cannot be empty');
    }
    if (t.length > maxCommentLength) {
      throw new BadRequestException('message is too long');
    }
    return new PostComment(
      props.id || null,
      props.postId.trim(),
      props.authorId.trim(),
      t,
      props.createdAt || new Date(),
      props.updatedAt || new Date(),
    );
  }

  getId(): string | null {
    return this.id;
  }
  getPostId(): string {
    return this.postId;
  }
  getAuthorId(): string {
    return this.authorId;
  }
  getMessage(): string {
    return this.message;
  }
  getCreatedAt(): Date {
    return this.createdAt;
  }
  getUpdatedAt(): Date {
    return this.updatedAt;
  }
}
