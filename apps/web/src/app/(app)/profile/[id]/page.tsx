'use client';

import { useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { apiClient } from '@/lib/api-client';
import { useEffect, useState } from 'react';
import type { UserResponse } from '@coffee-lovers/shared';
import { Skeleton } from '@/components/ui/skeleton';

export default function ProfilePage() {
  const params = useParams();
  const id = params.id as string;
  const [user, setUser] = useState<UserResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { body, status } = await apiClient.auth.getProfile({
          params: { id },
        });

        if (status === 200) {
          setUser(body);
        } else {
          setError('Usuário não encontrado');
        }
      } catch (err) {
        setError('Erro ao carregar perfil');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [id]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="container max-w-2xl py-10">
        <Card>
          <CardHeader className="flex flex-col items-center gap-4">
            <Skeleton className="h-24 w-24 rounded-full" />
            <div className="space-y-2 text-center">
              <Skeleton className="h-8 w-48 mx-auto" />
              <Skeleton className="h-4 w-32 mx-auto" />
            </div>
          </CardHeader>
          <CardContent>
            <Separator className="my-6" />
            <div className="space-y-4">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="container max-w-2xl py-10">
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-destructive">{error || 'Usuário não encontrado'}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container max-w-2xl py-10">
      <Card>
        <CardHeader className="flex flex-col items-center gap-4">
          <Avatar className="h-24 w-24">
            <AvatarImage src="" alt={user.name} />
            <AvatarFallback className="text-2xl">
              {user.name.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="text-center">
            <CardTitle className="text-3xl font-bold">{user.name}</CardTitle>
            <p className="text-muted-foreground">{user.email}</p>
          </div>
        </CardHeader>
        <CardContent>
          <Separator className="my-6" />
          <div className="space-y-4">
            <div className="flex justify-between">
              <span className="font-medium text-muted-foreground">Localização</span>
              <span>
                {user.city}, {user.state}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium text-muted-foreground">ID do Usuário</span>
              <span className="text-xs font-mono">{user.id}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium text-muted-foreground">Membro desde</span>
              <span>{formatDate(user.createdAt)}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
