/**
 * DB 전체 데이터 백업 스크립트
 * 실행: node scripts/backup-db.mjs
 * 결과: database/ 폴더에 테이블별 JSON 파일 + 통합 backup.json 생성
 */
import { createConnection } from "mysql2/promise";
import { writeFileSync, mkdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = join(__dirname, "..");

dotenv.config({ path: join(projectRoot, ".env") });

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error("❌ DATABASE_URL 환경 변수가 없습니다.");
  process.exit(1);
}

const TABLES = [
  "users",
  "ddc_records",
  "rcr_records",
  "manager_activities",
  "manager_activity_logs",
  "family_comments",
  "passwords",
  "auditor_config",
  "monthly_managers",
  "manager_evaluations",
  "monthly_allowances",
  "allowance_adjustments",
  "bug_report_rewards",
  "app_settings",
];

async function main() {
  const conn = await createConnection(DATABASE_URL);
  const dbDir = join(projectRoot, "database");
  mkdirSync(dbDir, { recursive: true });

  const timestamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
  const allData = { backup_at: new Date().toISOString(), tables: {} };

  console.log(`\n📦 DB 백업 시작 (${timestamp})\n`);

  for (const table of TABLES) {
    try {
      const [rows] = await conn.execute(`SELECT * FROM \`${table}\``);
      allData.tables[table] = rows;

      // 테이블별 개별 파일
      const filePath = join(dbDir, `${table}.json`);
      writeFileSync(filePath, JSON.stringify(rows, null, 2), "utf-8");
      console.log(`  ✅ ${table}: ${rows.length}행 → database/${table}.json`);
    } catch (err) {
      console.log(`  ⚠️  ${table}: 테이블 없음 또는 오류 (${err.message})`);
      allData.tables[table] = [];
    }
  }

  // 통합 백업 파일
  const backupPath = join(dbDir, "backup.json");
  writeFileSync(backupPath, JSON.stringify(allData, null, 2), "utf-8");
  console.log(`\n📄 통합 백업 → database/backup.json`);

  // README
  const readmePath = join(dbDir, "README.md");
  const totalRows = Object.values(allData.tables).reduce((s, r) => s + r.length, 0);
  writeFileSync(readmePath, `# DB 백업

백업 일시: ${allData.backup_at}

## 파일 목록

| 파일 | 테이블 | 행 수 |
|------|--------|-------|
${TABLES.map(t => `| ${t}.json | ${t} | ${(allData.tables[t] || []).length} |`).join("\n")}
| backup.json | 전체 통합 | ${totalRows} |

## 복원 방법

\`\`\`bash
# 특정 테이블 복원 (예시)
node scripts/restore-db.mjs --table ddc_records
\`\`\`

> ⚠️ 이 파일들은 자동 생성됩니다. 직접 편집하지 마세요.
`, "utf-8");

  await conn.end();
  console.log(`\n✅ 백업 완료! 총 ${totalRows}행\n`);
}

main().catch(err => {
  console.error("❌ 백업 실패:", err.message);
  process.exit(1);
});
