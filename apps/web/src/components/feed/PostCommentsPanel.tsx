"use client";

import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { formatFeedCommentDate } from "@/lib/feed-format-dates";
import { MAX_COMMENT_LENGTH, type CommentThread } from "./feed-types";

type PostCommentsPanelProps = {
  postId: string;
  thread: CommentThread | undefined;
  draft: string;
  formError: string | null;
  addBusy: boolean;
  isDeleteBusy: (commentId: string) => boolean;
  currentUserId: string | null;
  onDraftChange: (value: string) => void;
  onAddComment: () => void;
  onDeleteComment: (commentId: string) => void;
  onLoadMoreComments: (cursor: string) => void;
};

export function PostCommentsPanel({
  postId,
  thread,
  draft,
  formError,
  addBusy,
  isDeleteBusy,
  currentUserId,
  onDraftChange,
  onAddComment,
  onDeleteComment,
  onLoadMoreComments,
}: PostCommentsPanelProps) {
  return (
    <div className="space-y-3 rounded-md border border-border bg-muted/30 p-3">
      {thread?.loading && !thread.initialized ? (
        <div className="space-y-2">
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-2/3" />
        </div>
      ) : null}
      {thread?.error ? (
        <p className="text-xs text-destructive">{thread.error}</p>
      ) : null}
      {thread?.initialized
        ? thread.items.map((c) => {
            const isMine = currentUserId === c.author.id;
            return (
              <div
                key={c.id}
                className="flex gap-2 text-sm border-b border-border/60 pb-2 last:border-0 last:pb-0"
              >
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-foreground">
                    {c.author.name}
                    <span className="ml-2 font-normal text-xs text-muted-foreground">
                      {formatFeedCommentDate(c.createdAt)}
                    </span>
                  </p>
                  <p className="whitespace-pre-wrap break-words text-foreground/90">
                    {c.message}
                  </p>
                </div>
                {isMine ? (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 shrink-0 text-muted-foreground hover:text-destructive"
                    disabled={isDeleteBusy(c.id)}
                    onClick={() => onDeleteComment(c.id)}
                    aria-label="Excluir comentário"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                ) : null}
              </div>
            );
          })
        : null}
      {thread?.nextCursor ? (
        <Button
          type="button"
          variant="link"
          size="sm"
          className="h-auto p-0"
          disabled={thread.loadMoreLoading}
          onClick={() => onLoadMoreComments(thread.nextCursor as string)}
        >
          {thread.loadMoreLoading
            ? "Carregando…"
            : "Carregar mais comentários"}
        </Button>
      ) : null}

      <div className="space-y-2 pt-1">
        <Label
          htmlFor={`comment-${postId}`}
          className="text-xs text-muted-foreground"
        >
          Novo comentário
        </Label>
        <Textarea
          id={`comment-${postId}`}
          value={draft}
          onChange={(e) => {
            const v = e.target.value;
            if (v.length <= MAX_COMMENT_LENGTH) {
              onDraftChange(v);
            }
          }}
          placeholder="Escreva um comentário…"
          rows={2}
          className="resize-none text-sm"
        />
        {formError ? (
          <p className="text-xs text-destructive">{formError}</p>
        ) : null}
        <Button
          type="button"
          size="sm"
          disabled={addBusy}
          onClick={() => onAddComment()}
        >
          {addBusy ? "Enviando…" : "Comentar"}
        </Button>
      </div>
    </div>
  );
}
