import { resolveMediaUrl } from "@/lib/resolve-media-url";

type FeedPostImageGridProps = {
  imageUrls: string[];
};

export function FeedPostImageGrid({ imageUrls }: FeedPostImageGridProps) {
  if (imageUrls.length === 0) return null;
  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
      {imageUrls.map((url) => (
        <a
          key={url}
          href={resolveMediaUrl(url)}
          target="_blank"
          rel="noreferrer"
          className="block aspect-square overflow-hidden rounded-md border border-border bg-muted"
        >
          {/* eslint-disable-next-line @next/next/no-img-element -- URLs dinâmicas do backend /uploads/ */}
          <img
            src={resolveMediaUrl(url)}
            alt=""
            className="h-full w-full object-cover"
          />
        </a>
      ))}
    </div>
  );
}
