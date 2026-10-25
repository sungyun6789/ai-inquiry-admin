'use client';

import { User, useUserStore } from '@/stores/user';
import { api } from '@/utils/api';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function Layout({ children }: LayoutProps<'/'>) {
  const router = useRouter();
  const { user, setUser } = useUserStore();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return router.replace('/login');
    if (!user) {
      api
        .get<User>('/auth/user')
        .then(({ data }) => setUser(data))
        .catch(() => router.replace('/login'));
    }
  }, [user, router, setUser]);

  return children;
}
