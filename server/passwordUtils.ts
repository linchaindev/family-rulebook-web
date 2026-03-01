import { createPassword, getPasswordByMonth, getAppSetting, upsertPassword } from "./db";
import { notifyOwner } from "./_core/notification";

/**
 * Generate a random 4-digit password
 */
export function generateManagerPassword(): string {
  return Math.floor(1000 + Math.random() * 9000).toString();
}

/**
 * Generate a random 6-digit password
 */
export function generateAuditorPassword(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Generate passwords for a specific month and send email
 */
export async function generateAndSendPasswords(month: string) {
  // Check if passwords already exist for this month
  const existing = await getPasswordByMonth(month);
  if (existing) {
    console.log(`Passwords already exist for ${month}`);
    return existing;
  }

  // Generate new passwords
  const managerPassword = generateManagerPassword();
  const auditorPassword = generateAuditorPassword();

  // Save to database
  await createPassword({
    month,
    managerPassword,
    auditorPassword,
  });

  // Send email to auditor
  const emailContent = `
📅 **${month} 패밀리 룰북 비밀번호**

안녕하세요, 감사님!

이번 달 비밀번호가 생성되었습니다:

🔐 **매니저 비밀번호 (4자리)**: ${managerPassword}
🔐 **감사 비밀번호 (6자리)**: ${auditorPassword}

매니저 비밀번호는 감사님이 직접 매니저에게 전달해주세요.

감사 비밀번호는 감사 전용 관리 페이지 접속 시 사용됩니다.

---
KH 패밀리 룰북 시스템
  `.trim();

  await notifyOwner({
    title: `${month} 패밀리 룰북 비밀번호 생성`,
    content: emailContent,
  });

  console.log(`Passwords generated and sent for ${month}`);
  
  return {
    month,
    managerPassword,
    auditorPassword,
  };
}

/**
 * Get current month in YYYY-MM format
 */
export function getCurrentMonth(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}
