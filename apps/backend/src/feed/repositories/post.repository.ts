import { Post } from '../domain/post.entity';

export abstract class PostRepository {
  abstract create(post: Post): Promise<Post>;
  abstract findById(id: string): Promise<Post | null>;
  abstract findByIdAndAuthorId(
    id: string,
    authorId: string,
  ): Promise<Post | null>;
  abstract update(post: Post): Promise<Post>;
  abstract deleteById(id: string): Promise<void>;
}
