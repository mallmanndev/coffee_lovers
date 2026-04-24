import type { FeedCommentItem } from "@coffee-lovers/shared";

export const FEED_PAGE_SIZE = 20;
export const FEED_COMMENT_PAGE_SIZE = 30;
export const MAX_COMMENT_LENGTH = 2000;

export type CommentThread = {
  items: FeedCommentItem[];
  nextCursor: string | null;
  loading: boolean;
  loadMoreLoading: boolean;
  error: string | null;
  initialized: boolean;
};

export function emptyThread(): CommentThread {
  return {
    items: [],
    nextCursor: null,
    loading: false,
    loadMoreLoading: false,
    error: null,
    initialized: false,
  };
}
