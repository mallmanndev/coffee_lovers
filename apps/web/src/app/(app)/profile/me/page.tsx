'use client';

import { ProfileView } from '@/components/ProfileView';
import { getUserId } from '@/lib/auth-session';

export default function MyProfilePage() {
  const userId = getUserId();

  if (!userId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-muted-foreground text-sm">Carregando...</p>
      </div>
    );
  }

  return <ProfileView resolvedUserId={userId} />;
}
