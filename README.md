# AI Inquiry Admin

AI가 고객 문의를 중요도(HIGH / MEDIUM / LOW)로 자동 분류해, 급한 문의부터 보여 주는 관리자 서비스

- **Client**: Next.js 16, React 19, Zustand, axios, Tailwind CSS
- **Server**: Express 5, Drizzle ORM, MySQL, Redis, BullMQ, JWT, Zod
- **AI**: TypeSafe AI SDK (jev)

## 전체 흐름

```mermaid
sequenceDiagram
    actor U as 일반 유저
    actor A as 관리자
    participant C as Client (Next.js)
    participant S as Server (Express)
    participant DB as MySQL
    participant Q as Redis (BullMQ)
    participant W as Worker
    participant AI as jev

    U->>C: 문의 생성
    C->>S: POST /inquiry
    S->>DB: 요청한 사용자의 권한 조회
    S-->>C: 403 관리자 권한이 필요합니다
    Note over U,S: 문의 생성·수정·삭제·일괄 분류는 관리자만 가능 (목록 조회는 로그인한 모든 사용자 가능)

    A->>C: 문의 생성 (샘플 문의)
    C->>S: POST /inquiry
    S->>DB: 문의와 CREATED 이벤트 저장
    S->>Q: 분류 작업 등록 (jobId: priority-{id})
    S-->>C: 201 Created
    Q->>W: 작업 전달
    W->>DB: 문의 조회 (미분류·미삭제일 때만)
    W->>AI: 문의 내용으로 중요도 분류
    AI-->>W: HIGH / MEDIUM / LOW
    W->>DB: 미분류 상태일 때만 중요도 저장 + UPDATED 이벤트
    loop 3초마다
        C->>S: GET /inquiry
        S-->>C: 미분류 → HIGH → MEDIUM → LOW 순 목록
    end
    Note over A,S: 큐에 없는 미분류 문의(시드 데이터·분류 실패)는 일괄 분류(POST /inquiry/priority)로 등록
```

## AI 분류 정확도

AI 분류 결과는 사람이 따로 검토하지 않으므로, 정답셋을 만들어 정확도 측정 (`server/src/eval/priority.ts`)

- 정답셋: 50건 (HIGH 17 / MEDIUM 16 / LOW 17)
- 헷갈리기 쉬운 문의 포함: 말투와 실제 긴급도가 다른 문의, "결제"·"보안"이 들어갔지만 급하지 않은 문의, 분류를 조작하려는 문의
- 결과: 반복 실행 시 대부분 50/50, 가끔 환불 지연 문의가 MEDIUM으로 분류되어 49/50
- 개선: jev에 넘기는 HIGH 설명에 "환불 오류"를 추가한 뒤 50/50

## 실행 방법

```bash
# .env (루트): Docker로 MySQL을 띄울 때 사용
MYSQL_ROOT_PASSWORD=<MySQL root 비밀번호>

# server/.env: DATABASE_URL의 비밀번호는 MYSQL_ROOT_PASSWORD와 동일
DATABASE_URL=mysql://root:<MYSQL_ROOT_PASSWORD>@localhost:3306/ai_inquiry_admin
JWT_SECRET=<임의의 문자열>
TYPESAFE_API_KEY=<TypeSafe AI API 키>
REDIS_URL=redis://localhost:6379

# client/.env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

```bash
# MySQL, Redis 실행
docker compose up -d

# 서버
cd server
pnpm install
pnpm seed              # 마이그레이션 적용 + 테스트 데이터 생성 (기존 데이터는 초기화)
# 테스트 계정: `admin01@test.com` / `1234` (관리자), `user01@test.com` / `1234` (유저)
pnpm dev               # http://localhost:8000

# 클라이언트
cd client
pnpm install
pnpm dev               # http://localhost:3000
```
