import { drizzle } from "drizzle-orm/mysql2";
import { monthlyManagers } from "./drizzle/schema.ts";

const db = drizzle(process.env.DATABASE_URL);

await db.insert(monthlyManagers).values({
  month: '2026-02',
  managerId: 'jin',
}).onDuplicateKeyUpdate({
  set: { managerId: 'jin', updatedAt: new Date() },
});

console.log('2월 매니저를 진으로 설정했습니다.');
