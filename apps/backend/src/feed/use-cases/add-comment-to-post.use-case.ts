import { Injectable, NotFoundException } from '@nestjs/common';
import type { AddCommentInput } from '@coffee-lovers/shared';
import { PostComment } from '../domain/post-comment.entity';
import { PostRepository } from '../repositories/post.repository';
import { PostCommentRepository } from '../repositories/post-comment.repository';

@Injectable()
export class AddCommentToPostUseCase {
  constructor(
    private readonly postRepository: PostRepository,
    private readonly commentRepository: PostCommentRepository,
  ) {}

  async execute(
    postId: string,
    input: AddCommentInput,
    authorId: string,
  ): Promise<{ id: string }> {
    const post = await this.postRepository.findById(postId);
    if (!post) {
      throw new NotFoundException('Post não encontrado');
    }
    const comment = PostComment.create({
      postId,
      authorId,
      message: input.message,
    });
    const saved = await this.commentRepository.create(comment);
    const id = saved.getId();
    if (!id) {
      throw new Error('expected comment id after create');
    }
    return { id };
  }
}
