'use client';

import { useParams } from 'next/navigation';
import { ProfileView } from '@/components/ProfileView';

export default function ProfileByIdPage() {
  const params = useParams();
  const id = params.id as string;

  return <ProfileView resolvedUserId={id} />;
}
