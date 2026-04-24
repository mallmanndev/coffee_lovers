"use client";

import { useState } from "react";
import {
  Heart,
  MessageCircle,
  ChevronDown,
  ChevronUp,
  MoreHorizontal,
} from "lucide-react";
import type { FeedPostItem } from "@coffee-lovers/shared";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { formatFeedPostDate } from "@/lib/feed-format-dates";
import { cn } from "@/lib/utils";
import { FeedPostImageGrid } from "./FeedPostImageGrid";
import { PostCommentsPanel } from "./PostCommentsPanel";
import type { CommentThread } from "./feed-types";

export type FeedPostCardProps = {
  post: FeedPostItem;
  commentsOpen: boolean;
  thread: CommentThread | undefined;
  likeBusy: boolean;
  commentDraft: string;
  commentFormError: string | null;
  addCommentBusy: boolean;
  isDeleteCommentBusy: (commentId: string) => boolean;
  currentUserId: string | null;
  onLikeToggle: () => void;
  onToggleComments: () => void;
  onCommentDraftChange: (value: string, clearError: boolean) => void;
  onAddComment: () => void;
  onDeleteComment: (commentId: string) => void;
  onLoadMoreComments: (cursor: string) => void;
  isOwnPost?: boolean;
  onEditClick?: () => void;
  onDeleteClick?: () => void;
  deletePostBusy?: boolean;
};

export function FeedPostCard({
  post,
  commentsOpen,
  thread,
  likeBusy,
  commentDraft,
  commentFormError,
  addCommentBusy,
  isDeleteCommentBusy,
  currentUserId,
  onLikeToggle,
  onToggleComments,
  onCommentDraftChange,
  onAddComment,
  onDeleteComment,
  onLoadMoreComments,
  isOwnPost = false,
  onEditClick,
  onDeleteClick,
  deletePostBusy = false,
}: FeedPostCardProps) {
  const [actionsOpen, setActionsOpen] = useState(false);

  return (
    <Card className="w-full overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="font-semibold text-foreground">{post.author.name}</p>
            <p className="text-xs text-muted-foreground">
              {formatFeedPostDate(post.createdAt)}
            </p>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            {post.kind === "equipment_share" ? (
              <span className="text-xs rounded-full bg-secondary px-2 py-0.5 text-secondary-foreground">
                Equipamento
              </span>
            ) : null}
            {isOwnPost && onEditClick && onDeleteClick ? (
              <Popover open={actionsOpen} onOpenChange={setActionsOpen}>
                <PopoverTrigger asChild>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground"
                    aria-label="Ações do post"
                  >
                    <MoreHorizontal className="h-4 w-4" aria-hidden />
                  </Button>
                </PopoverTrigger>
                <PopoverContent align="end" className="w-40 p-1">
                  <div className="flex flex-col gap-0.5">
                    <Button
                      type="button"
                      variant="ghost"
                      className="h-8 w-full justify-start font-normal"
                      onClick={() => {
                        setActionsOpen(false);
                        onEditClick();
                      }}
                    >
                      Editar
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      className="h-8 w-full justify-start font-normal text-destructive hover:text-destructive"
                      disabled={deletePostBusy}
                      onClick={() => {
                        setActionsOpen(false);
                        onDeleteClick();
                      }}
                    >
                      {deletePostBusy ? "Excluindo…" : "Excluir"}
                    </Button>
                  </div>
                </PopoverContent>
              </Popover>
            ) : null}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3 pt-0">
        {post.shareSummary ? (
          <p className="text-sm text-muted-foreground border-l-2 pl-2">
            {post.shareSummary}
          </p>
        ) : null}
        <p className="text-sm whitespace-pre-wrap">{post.message}</p>
        <FeedPostImageGrid imageUrls={post.imageUrls} />

        <div className="flex flex-wrap items-center gap-3 pt-1 border-t border-border">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="gap-1.5 h-8 px-2"
            disabled={likeBusy}
            onClick={() => onLikeToggle()}
            aria-pressed={post.likedByMe}
          >
            <Heart
              className={cn(
                "h-4 w-4",
                post.likedByMe
                  ? "fill-destructive text-destructive"
                  : "text-muted-foreground",
              )}
              aria-hidden
            />
            <span className="text-xs tabular-nums">{post.likeCount}</span>
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="gap-1.5 h-8 px-2 text-muted-foreground"
            onClick={() => onToggleComments()}
          >
            <MessageCircle className="h-4 w-4" aria-hidden />
            <span className="text-xs">
              {post.commentCount}{" "}
              {commentsOpen ? (
                <ChevronUp className="inline h-3 w-3" />
              ) : (
                <ChevronDown className="inline h-3 w-3" />
              )}
            </span>
          </Button>
        </div>

        {commentsOpen ? (
          <PostCommentsPanel
            postId={post.id}
            thread={thread}
            draft={commentDraft}
            formError={commentFormError}
            addBusy={addCommentBusy}
            isDeleteBusy={isDeleteCommentBusy}
            currentUserId={currentUserId}
            onDraftChange={(v) => onCommentDraftChange(v, true)}
            onAddComment={onAddComment}
            onDeleteComment={onDeleteComment}
            onLoadMoreComments={onLoadMoreComments}
          />
        ) : null}
      </CardContent>
    </Card>
  );
}
