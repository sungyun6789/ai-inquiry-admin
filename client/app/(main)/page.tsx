'use client';

import { api } from '@/utils/api';
import { useEffect, useState } from 'react';

type InquiryResponse = {
  id: number;
  assigneeId: number;
  title: string;
  content: string;
  status: 'PENDING' | 'PROCESSING' | 'AUTO_RESOLVED' | 'REVIEW_REQUIRED' | 'FAILED';
  priority: 'HIGH' | 'MEDIUM' | 'LOW' | null;
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export default function Home() {
  const [inquiryList, setInquiryList] = useState<InquiryResponse[]>();

  const getInquiry = async () => {
    const { data } = await api.get<InquiryResponse[]>('/inquiry');
    setInquiryList(data);
  };

  useEffect(() => {
    getInquiry();
  }, []);

  return (
    <div className="p-3">
      <div className="flex justify-between mb-10">
        <div className="text-2xl font-bold">문의 내역 관리</div>
        <div className="flex gap-2">
          <button className="border p-2 cursor-pointer h-fit hover:bg-gray-50 outline-none">문의 생성</button>
          <button className="border p-2 cursor-pointer h-fit hover:bg-gray-50 outline-none">문의 분류</button>
        </div>
      </div>

      <div className="flex text-lg font-medium border-b p-2">
        <div className="flex-1">제목</div>
        <div className="flex-1">내용</div>
        <div className="flex-1">등록일</div>
        <div className="w-[200px]">상태</div>
        <div className="flex-1 text-center">중요도</div>
      </div>

      {inquiryList?.map((v) => {
        return (
          <div key={v.id} className="border-b px-2 py-3 flex">
            <div className="flex-1 line-clamp-1">{v.title}</div>
            <div className="flex-1 line-clamp-1">{v.content}</div>
            <div className="flex-1 line-clamp-1">{v.createdAt}</div>
            <select defaultValue={v.status} className="w-[200px] outline-none">
              <option value="PENDING">PENDING</option>
              <option value="PROCESSING">PROCESSING</option>
              <option value="AUTO_RESOLVED">AUTO_RESOLVED</option>
              <option value="REVIEW_REQUIRED">REVIEW_REQUIRED</option>
              <option value="FAILED">FAILED</option>
            </select>
            <div className="flex-1 line-clamp-1 text-center">{v.priority ?? '-'}</div>
          </div>
        );
      })}
    </div>
  );
}
