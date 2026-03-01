import { createPassword, getPasswordByMonth, getAppSetting, upsertPassword, getAuditorPassword } from "./db";
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
 * Generate FM password for a specific month and send notification.
 * FA password is managed globally (auditorConfig table) and is NOT regenerated here.
 */
export async function generateAndSendPasswords(month: string) {
  // Check if passwords already exist for this month
  const existing = await getPasswordByMonth(month);
  if (existing) {
    console.log(`Passwords already exist for ${month}`);
    // Return with current auditor password for notification purposes
    const auditorPassword = await getAuditorPassword();
    return { ...existing, auditorPassword: auditorPassword ?? '(미설정)' };
  }

  // Generate new manager password only
  const managerPassword = generateManagerPassword();

  // Save to database (FM 비밀번호만 저장)
  await createPassword({
    month,
    managerPassword,
  });

  // Get current global FA password for notification
  const auditorPassword = await getAuditorPassword();

  // Send notification
  const emailContent = `
📅 **${month} 패밀리 룰북 비밀번호**

안녕하세요, 감사님!

이번 달 매니저 비밀번호가 생성되었습니다:

🔐 **매니저 비밀번호 (4자리)**: ${managerPassword}
🔐 **감사 비밀번호 (6자리)**: ${auditorPassword ?? '(감사 관리 페이지에서 설정 필요)'}

매니저 비밀번호는 감사님이 직접 매니저에게 전달해주세요.
감사 비밀번호는 전역으로 관리되며 변경되지 않습니다.

---
KH 패밀리 룰북 시스템
  `.trim();

  await notifyOwner({
    title: `${month} 패밀리 룰북 비밀번호 생성`,
    content: emailContent,
  });

  console.log(`Manager password generated and sent for ${month}`);
  
  return {
    month,
    managerPassword,
    auditorPassword: auditorPassword ?? '(미설정)',
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
