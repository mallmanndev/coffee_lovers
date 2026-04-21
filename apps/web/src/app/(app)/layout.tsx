import { BottomNav } from "@/components/BottomNav";
import { RequireAuth } from "@/components/RequireAuth";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RequireAuth>
      {children}
      <BottomNav />
    </RequireAuth>
  );
}
