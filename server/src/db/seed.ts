import { db } from './index.ts';
import { users, inquiries, inquiryEvents } from './schema.ts';
import { reset } from 'drizzle-seed';
import { password } from '../utils/password.ts';

const seed = async () => {
  try {
    await reset(db, { users, inquiries, inquiryEvents });

    const insertedUsers = await db
      .insert(users)
      .values([
        { email: 'admin01@test.com', password: await password.hash('1234'), role: 'ADMIN' },
        { email: 'user01@test.com', password: await password.hash('1234'), role: 'USER' },
        { email: 'user02@test.com', password: await password.hash('1234'), role: 'USER' },
      ])
      .$returningId();

    console.log(`유저 데이터 ${insertedUsers.length}건 생성`);

    const insertedInquiries = await db
      .insert(inquiries)
      .values([
        { content: '회원가입에서 에러가 발생합니다.' },
        { content: '배송 조회가 3일째 같은 위치에 멈춰 있습니다.' },
        { content: '다크 모드도 지원해 주시면 안 되나요?' },
      ])
      .$returningId();

    console.log(`시드 데이터 ${insertedInquiries.length}건 생성 완료`);
  } finally {
    await db.$client.end();
  }
};

seed().catch((error) => {
  console.error('데이터 생성 실패:', error);
  process.exitCode = 1;
});
