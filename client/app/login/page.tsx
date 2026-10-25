'use client';

import { User, useUserStore } from '@/stores/user';
import { api } from '@/utils/api';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

type LoginReponse = { accessToken: string; user: User };

const page = () => {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { setUser } = useUserStore();

  const login = async () => {
    const { data } = await api.post<LoginReponse>('/auth/login', { email, password });
    if (data.accessToken) localStorage.setItem('token', data.accessToken);
    if (data.user) {
      setUser(data.user);
      router.replace('/');
    }
  };

  return (
    <div className="max-w-[400px] w-full m-auto flex flex-col gap-3">
      <div className="text-center text-3xl font-semibold">AI Inquiry Admin</div>

      <input
        className="border outline-none p-3"
        placeholder="이메일"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        className="border outline-none p-3"
        placeholder="비밀번호"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button className="border outline-none p-3 cursor-pointer hover:bg-gray-50" onClick={login}>
        로그인
      </button>
    </div>
  );
};

export default page;
