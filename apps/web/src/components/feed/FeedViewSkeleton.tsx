import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

const shellClass =
  "flex min-h-[calc(100dvh-4rem)] w-full flex-col items-stretch gap-4 px-4 pb-28 pt-8 max-w-2xl mx-auto w-full";

export function FeedViewSkeleton() {
  return (
    <div className={shellClass}>
      {[1, 2, 3].map((i) => (
        <Card key={i} className="w-full">
          <CardHeader className="space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-24" />
          </CardHeader>
          <CardContent className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
