"use client";

import { useCallback, useEffect, useState } from "react";
import type { FeedPostItem } from "@coffee-lovers/shared";
import { apiClient } from "@/lib/api-client";
import { getUserId } from "@/lib/auth-session";
import { applyLikeResponse } from "@/lib/feed-post-state";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { FeedPostCard } from "./FeedPostCard";
import { CreatePostForm } from "./CreatePostForm";
import { FeedViewSkeleton } from "./FeedViewSkeleton";
import {
  emptyThread,
  type CommentThread,
  MAX_COMMENT_LENGTH,
  FEED_PAGE_SIZE,
  FEED_COMMENT_PAGE_SIZE,
} from "./feed-types";

const shellClass =
  "flex min-h-[calc(100dvh-4rem)] w-full flex-col items-stretch gap-4 px-4 pb-28 pt-8 max-w-2xl mx-auto w-full";

export function FeedView() {
  const [items, setItems] = useState<FeedPostItem[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [likeBusy, setLikeBusy] = useState<Record<string, boolean>>({});
  const [openByPost, setOpenByPost] = useState<Record<string, boolean>>({});
  const [threads, setThreads] = useState<Record<string, CommentThread>>({});
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [formErrors, setFormErrors] = useState<Record<string, string | null>>(
    {},
  );
  const [addBusy, setAddBusy] = useState<Record<string, boolean>>({});
  const [deleteBusy, setDeleteBusy] = useState<Record<string, boolean>>({});
  const [editingPost, setEditingPost] = useState<FeedPostItem | null>(null);
  const [postToDelete, setPostToDelete] = useState<FeedPostItem | null>(null);
  const [deletingPostId, setDeletingPostId] = useState<string | null>(null);

  const currentUserId = getUserId();

  const loadInitial = useCallback(async () => {
    setError(null);
    setLoading(true);
    try {
      const res = await apiClient.feed.listPosts({
        query: { limit: FEED_PAGE_SIZE },
      });
      if (res.status === 200) {
        setItems(res.body.items);
        setNextCursor(res.body.nextCursor);
      } else {
        setError("Não foi possível carregar o feed.");
      }
    } catch {
      setError("Erro ao carregar o feed.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadInitial();
  }, [loadInitial]);

  const loadMore = async () => {
    if (nextCursor === null || loadingMore) return;
    setLoadingMore(true);
    setError(null);
    try {
      const res = await apiClient.feed.listPosts({
        query: { limit: FEED_PAGE_SIZE, cursor: nextCursor },
      });
      if (res.status === 200) {
        setItems((prev) => [...prev, ...res.body.items]);
        setNextCursor(res.body.nextCursor);
      } else {
        setError("Não foi possível carregar mais posts.");
      }
    } catch {
      setError("Erro ao carregar mais posts.");
    } finally {
      setLoadingMore(false);
    }
  };

  const replacePost = useCallback(
    (id: string, fn: (p: FeedPostItem) => FeedPostItem) => {
      setItems((prev) => prev.map((p) => (p.id === id ? fn(p) : p)));
    },
    [],
  );

  const handleLikeToggle = async (post: FeedPostItem) => {
    if (likeBusy[post.id]) return;
    setLikeBusy((b) => ({ ...b, [post.id]: true }));
    const wasLiked = post.likedByMe;
    const res = wasLiked
      ? await apiClient.feed.unlikePost({
          params: { id: post.id },
          body: {},
        })
      : await apiClient.feed.likePost({ params: { id: post.id }, body: {} });
    if (res.status === 200) {
      const { liked } = res.body;
      replacePost(post.id, (p) => applyLikeResponse(p, wasLiked, liked));
    } else if (res.status === 404) {
      setItems((prev) => prev.filter((p) => p.id !== post.id));
      setError("Um post não está mais disponível e foi removido da lista.");
    }
    setLikeBusy((b) => {
      const next = { ...b };
      delete next[post.id];
      return next;
    });
  };

  const loadComments = useCallback(
    async (postId: string, cursor?: string) => {
      const isFirst = !cursor;
      setThreads((t) => ({
        ...t,
        [postId]: {
          ...(t[postId] ?? emptyThread()),
          loading: isFirst,
          loadMoreLoading: !isFirst,
          error: null,
        },
      }));
      const res = await apiClient.feed.listComments({
        params: { id: postId },
        query: {
          limit: FEED_COMMENT_PAGE_SIZE,
          ...(cursor ? { cursor } : {}),
        },
      });
      if (res.status === 200) {
        setThreads((t) => {
          const cur = t[postId] ?? emptyThread();
          return {
            ...t,
            [postId]: {
              ...cur,
              items: cursor
                ? [...cur.items, ...res.body.items]
                : res.body.items,
              nextCursor: res.body.nextCursor,
              loading: false,
              loadMoreLoading: false,
              error: null,
              initialized: true,
            },
          };
        });
      } else {
        setThreads((t) => {
          const cur = t[postId] ?? emptyThread();
          return {
            ...t,
            [postId]: {
              ...cur,
              loading: false,
              loadMoreLoading: false,
              error: "Não foi possível carregar os comentários.",
            },
          };
        });
      }
    },
    [],
  );

  const toggleComments = (postId: string) => {
    const willOpen = !openByPost[postId];
    setOpenByPost((o) => ({ ...o, [postId]: willOpen }));
    if (willOpen && !threads[postId]?.initialized) {
      void loadComments(postId);
    }
  };

  const handleAddComment = async (postId: string) => {
    const raw = drafts[postId] ?? "";
    const message = raw.trim();
    if (message.length < 1) {
      setFormErrors((e) => ({
        ...e,
        [postId]: "Escreva uma mensagem para comentar.",
      }));
      return;
    }
    if (message.length > MAX_COMMENT_LENGTH) {
      setFormErrors((e) => ({ ...e, [postId]: "Mensagem muito longa." }));
      return;
    }
    setFormErrors((e) => ({ ...e, [postId]: null }));
    setAddBusy((b) => ({ ...b, [postId]: true }));
    const res = await apiClient.feed.addComment({
      params: { id: postId },
      body: { message },
    });
    if (res.status === 201) {
      replacePost(postId, (p) => ({
        ...p,
        commentCount: p.commentCount + 1,
      }));
      setDrafts((d) => ({ ...d, [postId]: "" }));
      void loadComments(postId);
    } else {
      setFormErrors((e) => ({
        ...e,
        [postId]: "Não foi possível enviar o comentário.",
      }));
    }
    setAddBusy((b) => {
      const n = { ...b };
      delete n[postId];
      return n;
    });
  };

  const handleDeleteComment = async (postId: string, commentId: string) => {
    const key = `${postId}:${commentId}`;
    if (deleteBusy[key]) return;
    setDeleteBusy((b) => ({ ...b, [key]: true }));
    const res = await apiClient.feed.deleteComment({
      params: { postId, commentId },
      body: {},
    });
    if (res.status === 204) {
      setThreads((t) => {
        const cur = t[postId] ?? emptyThread();
        return {
          ...t,
          [postId]: {
            ...cur,
            items: cur.items.filter((c) => c.id !== commentId),
          },
        };
      });
      replacePost(postId, (p) => ({
        ...p,
        commentCount: Math.max(0, p.commentCount - 1),
      }));
    }
    setDeleteBusy((b) => {
      const n = { ...b };
      delete n[key];
      return n;
    });
  };

  const handleConfirmDeletePost = async () => {
    if (!postToDelete) return;
    const id = postToDelete.id;
    if (deletingPostId) return;
    setDeletingPostId(id);
    setError(null);
    try {
      const res = await apiClient.feed.deletePost({
        params: { id },
        body: {},
      });
      if (res.status === 204) {
        setItems((prev) => prev.filter((p) => p.id !== id));
        setOpenByPost((o) => {
          const n = { ...o };
          delete n[id];
          return n;
        });
        setThreads((t) => {
          const n = { ...t };
          delete n[id];
          return t;
        });
        setDrafts((d) => {
          const n = { ...d };
          delete n[id];
          return n;
        });
        setFormErrors((e) => {
          const n = { ...e };
          delete n[id];
          return n;
        });
        setPostToDelete(null);
      } else {
        setError("Não foi possível excluir o post.");
      }
    } catch {
      setError("Erro ao excluir o post.");
    } finally {
      setDeletingPostId(null);
    }
  };

  if (loading) {
    return <FeedViewSkeleton />;
  }

  if (error && items.length === 0) {
    return (
      <div className={shellClass}>
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <Button
          type="button"
          variant="secondary"
          onClick={() => void loadInitial()}
        >
          Tentar novamente
        </Button>
      </div>
    );
  }

  return (
    <div className={shellClass}>
      <Dialog
        open={editingPost !== null}
        onOpenChange={(open) => {
          if (!open) setEditingPost(null);
        }}
      >
        <DialogContent
          className="max-w-lg sm:max-w-lg"
          showCloseButton
        >
          <DialogHeader>
            <DialogTitle>Editar post</DialogTitle>
            <DialogDescription>
              Altere o texto ou as imagens. As curtidas e comentários são
              mantidos.
            </DialogDescription>
          </DialogHeader>
          {editingPost ? (
            <CreatePostForm
              key={editingPost.id}
              editPostId={editingPost.id}
              className="pt-1"
              initialMessage={editingPost.message}
              initialImageUrls={editingPost.imageUrls}
              initialShareSummary={editingPost.shareSummary ?? ""}
              equipmentShare={
                editingPost.kind === "equipment_share" &&
                editingPost.userEquipamentId
                  ? {
                      userEquipamentId: editingPost.userEquipamentId,
                      shareSummary: editingPost.shareSummary,
                    }
                  : undefined
              }
              resetOnSuccess
              onSuccess={(updated) => {
                setItems((prev) =>
                  prev.map((p) => (p.id === updated.id ? updated : p)),
                );
                setEditingPost(null);
              }}
            />
          ) : null}
        </DialogContent>
      </Dialog>

      <Dialog
        open={postToDelete !== null}
        onOpenChange={(open) => {
          if (!open && !deletingPostId) setPostToDelete(null);
        }}
      >
        <DialogContent showCloseButton={!deletingPostId}>
          <DialogHeader>
            <DialogTitle>Excluir post?</DialogTitle>
            <DialogDescription>
              Essa ação não pode ser desfeita. O post e o que você escreveu
              nele serão removidos.
            </DialogDescription>
          </DialogHeader>
          <div className="mt-2 flex flex-col-reverse gap-2 pt-2 sm:mt-0 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="secondary"
              disabled={!!deletingPostId}
              onClick={() => setPostToDelete(null)}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              variant="destructive"
              disabled={!!deletingPostId}
              onClick={() => void handleConfirmDeletePost()}
            >
              {deletingPostId ? "Excluindo…" : "Excluir"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {error && items.length > 0 ? (
        <Alert variant="destructive" className="w-full">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}

      {items.length === 0 && !error ? (
        <p className="text-center text-sm text-muted-foreground py-8">
          Nenhum post ainda. Quando houver atividade, ela aparece aqui.
        </p>
      ) : null}

      {items.map((post) => {
        const open = openByPost[post.id];
        const thread = threads[post.id];
        const isOwnPost = Boolean(
          currentUserId && post.author.id === currentUserId,
        );
        return (
          <FeedPostCard
            key={post.id}
            post={post}
            commentsOpen={!!open}
            thread={thread}
            likeBusy={!!likeBusy[post.id]}
            commentDraft={drafts[post.id] ?? ""}
            commentFormError={formErrors[post.id] ?? null}
            addCommentBusy={!!addBusy[post.id]}
            isDeleteCommentBusy={(commentId) =>
              !!deleteBusy[`${post.id}:${commentId}`]
            }
            currentUserId={currentUserId}
            isOwnPost={isOwnPost}
            onEditClick={() => setEditingPost(post)}
            onDeleteClick={() => setPostToDelete(post)}
            deletePostBusy={deletingPostId === post.id}
            onLikeToggle={() => void handleLikeToggle(post)}
            onToggleComments={() => toggleComments(post.id)}
            onCommentDraftChange={(value, clearError) => {
              setDrafts((d) => ({ ...d, [post.id]: value }));
              if (clearError && formErrors[post.id]) {
                setFormErrors((fe) => ({ ...fe, [post.id]: null }));
              }
            }}
            onAddComment={() => void handleAddComment(post.id)}
            onDeleteComment={(commentId) =>
              void handleDeleteComment(post.id, commentId)
            }
            onLoadMoreComments={(cursor) => void loadComments(post.id, cursor)}
          />
        );
      })}

      {nextCursor ? (
        <div className="flex justify-center pb-4">
          <Button
            type="button"
            variant="secondary"
            disabled={loadingMore}
            onClick={() => void loadMore()}
          >
            {loadingMore ? "Carregando…" : "Carregar mais posts"}
          </Button>
        </div>
      ) : null}
    </div>
  );
}
