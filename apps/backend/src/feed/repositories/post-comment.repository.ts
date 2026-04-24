import { PostComment } from '../domain/post-comment.entity';

export abstract class PostCommentRepository {
  abstract create(comment: PostComment): Promise<PostComment>;
  abstract findById(id: string): Promise<PostComment | null>;
  abstract findByIdAndAuthorId(
    id: string,
    authorId: string,
  ): Promise<PostComment | null>;
  abstract countByPostIds(postIds: string[]): Promise<Map<string, number>>;
  abstract deleteByPostId(postId: string): Promise<void>;
  abstract deleteById(id: string): Promise<void>;
}
