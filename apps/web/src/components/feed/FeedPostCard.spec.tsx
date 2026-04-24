import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { FeedPostItem } from "@coffee-lovers/shared";
import { FeedPostCard } from "./FeedPostCard";

const basePost: FeedPostItem = {
  id: "p1",
  message: "Mensagem do post de teste",
  imageUrls: [],
  author: { id: "a1", name: "Autor Teste" },
  likeCount: 2,
  commentCount: 1,
  likedByMe: false,
  kind: "user",
  createdAt: "2024-01-15T10:00:00.000Z",
  updatedAt: "2024-01-15T10:00:00.000Z",
};

describe("FeedPostCard", () => {
  it("renderiza autor, mensagem e ações de curtir e comentar", () => {
    const noop = () => {
      // handlers mock
    };
    render(
      <FeedPostCard
        post={basePost}
        commentsOpen={false}
        thread={undefined}
        likeBusy={false}
        commentDraft=""
        commentFormError={null}
        addCommentBusy={false}
        isDeleteCommentBusy={() => false}
        currentUserId="x"
        onLikeToggle={noop}
        onToggleComments={noop}
        onCommentDraftChange={noop}
        onAddComment={noop}
        onDeleteComment={noop}
        onLoadMoreComments={noop}
      />,
    );

    expect(screen.getByText("Autor Teste")).toBeInTheDocument();
    expect(screen.getByText("Mensagem do post de teste")).toBeInTheDocument();
    expect(screen.getAllByRole("button").length).toBeGreaterThanOrEqual(2);
  });

  it("exibe o selo de equipamento quando o post é equipment_share com resumo", () => {
    const post: FeedPostItem = {
      ...basePost,
      kind: "equipment_share",
      userEquipamentId: "ue1",
      shareSummary: "Resumo do equipamentó",
    };
    const noop = () => {};
    render(
      <FeedPostCard
        post={post}
        commentsOpen={false}
        thread={undefined}
        likeBusy={false}
        commentDraft=""
        commentFormError={null}
        addCommentBusy={false}
        isDeleteCommentBusy={() => false}
        currentUserId={null}
        onLikeToggle={noop}
        onToggleComments={noop}
        onCommentDraftChange={noop}
        onAddComment={noop}
        onDeleteComment={noop}
        onLoadMoreComments={noop}
      />,
    );

    expect(screen.getByText("Equipamento")).toBeInTheDocument();
    expect(screen.getByText("Resumo do equipamentó")).toBeInTheDocument();
  });

  it("não exibe o menu de ações quando o usuário não é o autor", () => {
    const noop = () => {};
    render(
      <FeedPostCard
        post={basePost}
        commentsOpen={false}
        thread={undefined}
        likeBusy={false}
        commentDraft=""
        commentFormError={null}
        addCommentBusy={false}
        isDeleteCommentBusy={() => false}
        currentUserId="outro-usuario"
        onLikeToggle={noop}
        onToggleComments={noop}
        onCommentDraftChange={noop}
        onAddComment={noop}
        onDeleteComment={noop}
        onLoadMoreComments={noop}
      />,
    );

    expect(
      screen.queryByRole("button", { name: "Ações do post" }),
    ).not.toBeInTheDocument();
  });

  it("exibe Editar e Excluir no menu quando é o post do usuário", async () => {
    const user = userEvent.setup();
    const onEdit = jest.fn();
    const onDelete = jest.fn();
    const myPost: FeedPostItem = {
      ...basePost,
      author: { id: "meu-id", name: "Eu" },
    };
    render(
      <FeedPostCard
        post={myPost}
        commentsOpen={false}
        thread={undefined}
        likeBusy={false}
        commentDraft=""
        commentFormError={null}
        addCommentBusy={false}
        isDeleteCommentBusy={() => false}
        currentUserId="meu-id"
        isOwnPost
        onEditClick={onEdit}
        onDeleteClick={onDelete}
        onLikeToggle={() => {}}
        onToggleComments={() => {}}
        onCommentDraftChange={() => {}}
        onAddComment={() => {}}
        onDeleteComment={() => {}}
        onLoadMoreComments={() => {}}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Ações do post" }));
    const editar = await screen.findByRole("button", { name: "Editar" });
    expect(editar).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Excluir" })).toBeInTheDocument();
  });
});
