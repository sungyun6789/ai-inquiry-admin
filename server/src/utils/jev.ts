import { choice, TypeSafeClient } from '@typesafe-ai/sdk';

export const classifyPriority = async (content: string) => {
  const client = new TypeSafeClient();
  const response = await client.systemOne({
    state: content,
    questions: {
      priority: choice('고객 문의의 긴급성과 영향도를 기준으로 중요도를 선택하세요.', {
        HIGH: '결제 오류, 서비스 이용 불가, 보안 문제 등 즉각적인 대응이 필요한 문의',
        MEDIUM: '일부 기능 오류나 반복적인 불편 등 일반적인 대응이 필요한 문의',
        LOW: '사용법 안내, 단순 정보 요청, 개선 제안 등 긴급성이 낮은 문의',
      }),
    },
  });

  return response.answers.priority.choice;
};
