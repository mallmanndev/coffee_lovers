import type { FeedPostItem } from "@coffee-lovers/shared";

/**
 * Atualiza curtida e contador após resposta da API de like/unlike.
 */
export function applyLikeResponse(
  post: FeedPostItem,
  wasLiked: boolean,
  liked: boolean,
): FeedPostItem {
  const countChanged = liked !== wasLiked;
  const likeCount = countChanged
    ? Math.max(0, post.likeCount + (liked ? 1 : -1))
    : post.likeCount;
  return { ...post, likedByMe: liked, likeCount };
}
