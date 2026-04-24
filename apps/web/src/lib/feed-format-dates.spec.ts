import { formatFeedCommentDate, formatFeedPostDate } from "./feed-format-dates";

describe("formatFeedPostDate", () => {
  it("retorna string não vazia para ISO fixo", () => {
    const s = formatFeedPostDate("2024-06-15T14:30:00.000Z");
    expect(typeof s).toBe("string");
    expect(s.length).toBeGreaterThan(0);
  });
});

describe("formatFeedCommentDate", () => {
  it("retorna string não vazia para ISO fixo", () => {
    const s = formatFeedCommentDate("2024-03-01T08:00:00.000Z");
    expect(typeof s).toBe("string");
    expect(s.length).toBeGreaterThan(0);
  });
});
