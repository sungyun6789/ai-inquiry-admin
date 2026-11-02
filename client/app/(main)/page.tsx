'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { api } from '@/utils/api';
import { getMockInquiry } from '@/utils/mock';
import dayjs from 'dayjs';
import { useEffect, useState } from 'react';

type InquiryResponse = {
  id: number;
  assignee_id: number | null;
  content: string;
  priority: 'HIGH' | 'MEDIUM' | 'LOW' | null;
  deleted_at: string | null;
  created_at: string;
  updated_at: string;
};

const PRIORITY_MAP = { HIGH: '높음', MEDIUM: '보통', LOW: '낮음' };
const PRIORITY_TONE = { HIGH: 'danger', MEDIUM: 'warning', LOW: 'success' } as const;

export default function Home() {
  const [inquiryList, setInquiryList] = useState<InquiryResponse[]>();

  const getInquiry = async () => {
    const { data } = await api.get<InquiryResponse[]>('/inquiry');
    setInquiryList(data);
  };

  const createInquiry = async () => {
    await api.post('/inquiry', { content: getMockInquiry() });
    getInquiry();
  };

  const deleteInquiry = async (id: number) => {
    if (confirm('문의를 삭제하시겠습니까?')) {
      await api.delete(`/inquiry/${id}`);
      getInquiry();
    }
  };

  const classifyInquiryPriority = async () => {
    if (confirm('문의 중요도를 분류하시겠습니까?')) {
      const { data } = await api.post('/inquiry/priority');
      if (data.message) alert(data.message);
      getInquiry();
    }
  };

  useEffect(() => {
    getInquiry();
    const timer = setInterval(getInquiry, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <div className="text-2xl font-bold">문의 내역 관리</div>
        <div className="flex gap-2">
          <Button onClick={createInquiry}>문의 생성</Button>
          <Button variant="primary" onClick={classifyInquiryPriority}>
            문의 중요도 분류
          </Button>
        </div>
      </div>

      <Table className="table-fixed">
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px]">번호</TableHead>
            <TableHead>내용</TableHead>
            <TableHead className="w-[200px]">등록일</TableHead>
            <TableHead className="w-[200px]">수정일</TableHead>
            <TableHead className="w-[200px]">중요도</TableHead>
            <TableHead className="w-[100px] text-center">-</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {inquiryList?.map((v) => {
            return (
              <TableRow key={v.id}>
                <TableCell className="truncate">{v.id}</TableCell>
                <TableCell className="truncate">{v.content}</TableCell>
                <TableCell className="truncate">{dayjs(v.created_at).format('YYYY-MM-DD HH:mm:ss')}</TableCell>
                <TableCell className="truncate">{dayjs(v.updated_at).format('YYYY-MM-DD HH:mm:ss')}</TableCell>
                <TableCell>
                  <Badge tone={v.priority ? PRIORITY_TONE[v.priority] : 'neutral'}>
                    {v.priority ? PRIORITY_MAP[v.priority] : '미분류'}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Button size="sm" onClick={() => deleteInquiry(v.id)}>
                    삭제
                  </Button>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
