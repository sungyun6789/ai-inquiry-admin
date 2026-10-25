import { mysqlTable, mysqlEnum, int, varchar, text, timestamp, json } from 'drizzle-orm/mysql-core';

// 사용자 권한
export const USER_ROLES = ['USER', 'ADMIN'] as const;

// 문의 처리 상태
export const INQUIRY_STATUSES = ['PENDING', 'PROCESSING', 'AUTO_RESOLVED', 'REVIEW_REQUIRED', 'FAILED'] as const;

// AI 분류 중요도
export const INQUIRY_PRIORITIES = ['HIGH', 'MEDIUM', 'LOW'] as const;

// 로그 유형
export const INQUIRY_EVENT_TYPES = ['CREATED', 'UPDATED', 'DELETED', 'STATUS_CHANGED'] as const;

// 사용자
export const users = mysqlTable('users', {
  id: int('id').primaryKey().autoincrement(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  password: text('password').notNull(),
  role: mysqlEnum('role', USER_ROLES).notNull().default('USER'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

// 문의
export const inquiries = mysqlTable('inquiries', {
  id: int('id').primaryKey().autoincrement(),
  assigneeId: int('assignee_id'),
  content: text('content').notNull(),
  status: mysqlEnum('status', INQUIRY_STATUSES).notNull().default('PENDING'),
  priority: mysqlEnum('priority', INQUIRY_PRIORITIES),
  deletedAt: timestamp('deleted_at'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow().onUpdateNow(),
});

// 문의 변경 로그
export const inquiryEvents = mysqlTable('inquiry_events', {
  id: int('id').primaryKey().autoincrement(),
  inquiryId: int('inquiry_id').notNull(),
  userId: int('user_id'),
  eventType: mysqlEnum('event_type', INQUIRY_EVENT_TYPES).notNull(),
  metadata: json('metadata'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});
