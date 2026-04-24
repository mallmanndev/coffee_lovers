import type { FeedPostItem } from "@coffee-lovers/shared";
import { applyLikeResponse } from "./feed-post-state";

function makePost(over: Partial<FeedPostItem> = {}): FeedPostItem {
  return {
    id: "p1",
    message: "m",
    imageUrls: [],
    author: { id: "u1", name: "User" },
    likeCount: 3,
    commentCount: 0,
    likedByMe: false,
    kind: "user",
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-01T00:00:00.000Z",
    ...over,
  };
}

describe("applyLikeResponse", () => {
  it("incrementa likeCount ao curtir quando não estava curtido", () => {
    const p = makePost({ likedByMe: false, likeCount: 2 });
    const out = applyLikeResponse(p, false, true);
    expect(out.likedByMe).toBe(true);
    expect(out.likeCount).toBe(3);
  });

  it("decrementa likeCount ao descurtir quando estava curtido", () => {
    const p = makePost({ likedByMe: true, likeCount: 5 });
    const out = applyLikeResponse(p, true, false);
    expect(out.likedByMe).toBe(false);
    expect(out.likeCount).toBe(4);
  });

  it("não altera contagem se o estado efetivo não mudou (idempotente)", () => {
    const p = makePost({ likedByMe: true, likeCount: 10 });
    const out = applyLikeResponse(p, true, true);
    expect(out.likeCount).toBe(10);
  });

  it("garante likeCount mínimo 0", () => {
    const p = makePost({ likedByMe: true, likeCount: 0 });
    const out = applyLikeResponse(p, true, false);
    expect(out.likeCount).toBe(0);
  });
});
