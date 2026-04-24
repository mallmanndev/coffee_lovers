import { PostLikeRecord } from './post-like.types';

export abstract class PostLikeRepository {
  abstract addLike(userId: string, postId: string): Promise<PostLikeRecord | null>;
  /** Returns false if no row existed */
  abstract removeLike(userId: string, postId: string): Promise<boolean>;
  abstract countByPostIds(postIds: string[]): Promise<Map<string, number>>;
  abstract hasLike(userId: string, postId: string): Promise<boolean>;
  abstract deleteByPostId(postId: string): Promise<void>;
}
