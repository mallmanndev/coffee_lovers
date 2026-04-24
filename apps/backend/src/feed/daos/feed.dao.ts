import type {
  FeedCommentListResponse,
  FeedPostItem,
  FeedPostListResponse,
} from '@coffee-lovers/shared';

export const FEED_DAO = Symbol('FeedDao');

export interface FeedDao {
  listPosts(
    viewerUserId: string,
    limit: number,
    cursor: string | undefined,
  ): Promise<FeedPostListResponse>;

  getPostItemById(
    postId: string,
    viewerUserId: string,
  ): Promise<FeedPostItem | null>;

  listComments(
    postId: string,
    limit: number,
    cursor: string | undefined,
  ): Promise<FeedCommentListResponse>;
}
