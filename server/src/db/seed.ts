import { pool } from './index.ts';
import { password } from '../utils/password.ts';
import type { ResultSetHeader } from 'mysql2';

const seed = async () => {
  try {
    await pool.query('truncate table users');
    await pool.query('truncate table inquiries');
    await pool.query('truncate table inquiry_events');

    const [insertedUsers] = await pool.query<ResultSetHeader>('insert into users (email, password, role) values ?', [
      [
        ['admin01@test.com', await password.hash('1234'), 'ADMIN'],
        ['user01@test.com', await password.hash('1234'), 'USER'],
        ['user02@test.com', await password.hash('1234'), 'USER'],
      ],
    ]);

    console.log(`유저 데이터 ${insertedUsers.affectedRows}건 생성`);

    const [insertedInquiries] = await pool.query<ResultSetHeader>('insert into inquiries (content) values ?', [
      [
        ['회원가입에서 에러가 발생합니다.'],
        ['배송 조회가 3일째 같은 위치에 멈춰 있습니다.'],
        ['다크 모드도 지원해 주시면 안 되나요?'],
      ],
    ]);

    console.log(`시드 데이터 ${insertedInquiries.affectedRows}건 생성 완료`);
  } finally {
    await pool.end();
  }
};

seed().catch((error) => {
  console.error('데이터 생성 실패:', error);
  process.exitCode = 1;
});
