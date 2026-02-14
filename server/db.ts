import { eq, and, desc, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { 
  InsertUser, 
  users, 
  ddcRecords, 
  InsertDDCRecord,
  rcrRecords,
  InsertRCRRecord,
  managerActivities,
  InsertManagerActivity,
  familyComments,
  InsertFamilyComment,
  passwords,
  InsertPassword,
  monthlyManagers,
  InsertMonthlyManager,
  managerEvaluations,
  InsertManagerEvaluation,
  managerActivityLogs,
  InsertManagerActivityLog,
  monthlyAllowances,
  InsertMonthlyAllowance,
  bugReportRewards,
  InsertBugReportReward
} from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// DDC Records
export async function createDDCRecord(record: InsertDDCRecord) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(ddcRecords).values(record);
  return result;
}

export async function getAllDDCRecords() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const records = await db
    .select()
    .from(ddcRecords)
    .orderBy(desc(ddcRecords.date));
  
  return records;
}

export async function getDDCRecordsByMember(memberId: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const records = await db
    .select()
    .from(ddcRecords)
    .where(eq(ddcRecords.memberId, memberId))
    .orderBy(desc(ddcRecords.date));
  
  return records;
}

export async function getDDCRecordsByMonth(month: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  // month format: YYYY-MM, date format: YYYY-MM-DD
  const records = await db
    .select()
    .from(ddcRecords)
    .where(sql`DATE_FORMAT(${ddcRecords.date}, '%Y-%m') = ${month}`)
    .orderBy(ddcRecords.date);
  
  return records;
}

// RCR Records
export async function createRCRRecord(record: InsertRCRRecord) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(rcrRecords).values(record);
  return result;
}

export async function getAllRCRRecords() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const records = await db
    .select()
    .from(rcrRecords)
    .orderBy(desc(rcrRecords.date));
  
  return records;
}

export async function getRCRRecordsByMember(memberId: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const records = await db
    .select()
    .from(rcrRecords)
    .where(eq(rcrRecords.memberId, memberId))
    .orderBy(desc(rcrRecords.date));
  
  return records;
}

// Manager Activities
export async function createManagerActivity(activity: InsertManagerActivity) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(managerActivities).values(activity);
  return result;
}

export async function getManagerActivityByMonth(month: string, managerId: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const records = await db
    .select()
    .from(managerActivities)
    .where(
      and(
        eq(managerActivities.month, month),
        eq(managerActivities.managerId, managerId)
      )
    )
    .limit(1);
  
  return records.length > 0 ? records[0] : null;
}

export async function getAllManagerActivities() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const records = await db
    .select()
    .from(managerActivities)
    .orderBy(desc(managerActivities.month));
  
  return records;
}

export async function getManagerActivitiesByManager(managerId: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const records = await db
    .select()
    .from(managerActivities)
    .where(eq(managerActivities.managerId, managerId))
    .orderBy(desc(managerActivities.month));
  
  return records;
}

export async function updateManagerActivity(
  month: string,
  managerId: string,
  updates: Partial<InsertManagerActivity>
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db
    .update(managerActivities)
    .set(updates)
    .where(
      and(
        eq(managerActivities.month, month),
        eq(managerActivities.managerId, managerId)
      )
    );
  
  return result;
}

// Family Comments
export async function createComment(comment: InsertFamilyComment) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(familyComments).values(comment);
  return result;
}

export async function getAllComments() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const comments = await db
    .select()
    .from(familyComments)
    .orderBy(desc(familyComments.createdAt));
  
  return comments;
}

export async function getCommentsByMember(memberName: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const comments = await db
    .select()
    .from(familyComments)
    .where(eq(familyComments.toMember, memberName))
    .orderBy(desc(familyComments.createdAt));
  
  return comments;
}

export async function deleteComment(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db
    .delete(familyComments)
    .where(eq(familyComments.id, id));
  
  return result;
}

// Password Management
export async function createPassword(data: InsertPassword) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(passwords).values(data);
  return result;
}

export async function getPasswordByMonth(month: string) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(passwords).where(eq(passwords.month, month)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function verifyManagerPassword(month: string, password: string): Promise<boolean> {
  const record = await getPasswordByMonth(month);
  return record?.managerPassword === password;
}

export async function verifyAuditorPassword(month: string, password: string): Promise<boolean> {
  const record = await getPasswordByMonth(month);
  return record?.auditorPassword === password;
}

// Update and Delete functions for Auditor Admin
export async function updateDDCRecord(id: number, updates: Partial<InsertDDCRecord>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db
    .update(ddcRecords)
    .set(updates)
    .where(eq(ddcRecords.id, id));
  
  return result;
}

export async function deleteDDCRecord(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db
    .delete(ddcRecords)
    .where(eq(ddcRecords.id, id));
  
  return result;
}

export async function updateRCRRecord(id: number, updates: Partial<InsertRCRRecord>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db
    .update(rcrRecords)
    .set(updates)
    .where(eq(rcrRecords.id, id));
  
  return result;
}

export async function deleteRCRRecord(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db
    .delete(rcrRecords)
    .where(eq(rcrRecords.id, id));
  
  return result;
}

// Monthly Manager Functions
export async function setMonthlyManager(month: string, managerId: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.insert(monthlyManagers).values({ month, managerId }).onDuplicateKeyUpdate({
    set: { managerId, updatedAt: new Date() },
  });
}

export async function getMonthlyManager(month: string) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(monthlyManagers).where(eq(monthlyManagers.month, month)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getAllMonthlyManagers() {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(monthlyManagers).orderBy(desc(monthlyManagers.month));
}

// Manager Evaluation Functions
export async function createManagerEvaluation(evaluation: InsertManagerEvaluation) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.insert(managerEvaluations).values(evaluation);
}

export async function getManagerEvaluationsByMonth(month: string) {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(managerEvaluations).where(eq(managerEvaluations.month, month));
}

export async function getAllManagerEvaluations() {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(managerEvaluations);
}

export async function deleteManagerEvaluationsByMonth(month: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.delete(managerEvaluations).where(eq(managerEvaluations.month, month));
}

// Manager Activity Logs Functions
export async function createManagerActivityLog(log: InsertManagerActivityLog) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(managerActivityLogs).values(log);
  return result;
}

export async function getManagerActivityLogsByMonth(month: string) {
  const db = await getDb();
  if (!db) return [];
  
  // month format: YYYY-MM, date format: YYYY-MM-DD
  const logs = await db
    .select()
    .from(managerActivityLogs)
    .where(sql`DATE_FORMAT(${managerActivityLogs.date}, '%Y-%m') = ${month}`)
    .orderBy(desc(managerActivityLogs.date));
  
  return logs;
}

export async function getManagerActivityLogsByMember(memberId: string) {
  const db = await getDb();
  if (!db) return [];
  
  const logs = await db
    .select()
    .from(managerActivityLogs)
    .where(eq(managerActivityLogs.memberId, memberId))
    .orderBy(desc(managerActivityLogs.date));
  
  return logs;
}

export async function getAllManagerActivityLogs() {
  const db = await getDb();
  if (!db) return [];
  
  const logs = await db
    .select()
    .from(managerActivityLogs)
    .orderBy(desc(managerActivityLogs.date));
  
  return logs;
}

export async function updateManagerActivityLog(id: number, updates: Partial<InsertManagerActivityLog>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db
    .update(managerActivityLogs)
    .set(updates)
    .where(eq(managerActivityLogs.id, id));
  
  return result;
}

export async function deleteManagerActivityLog(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db
    .delete(managerActivityLogs)
    .where(eq(managerActivityLogs.id, id));
  
  return result;
}

// ==================== Monthly Allowances ====================

export async function upsertMonthlyAllowance(allowance: InsertMonthlyAllowance) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  // Calculate final allowance
  const finalAllowance = (allowance.baseAllowance || 0) + (allowance.bonus || 0) - (allowance.penalty || 0);
  
  const existing = await db
    .select()
    .from(monthlyAllowances)
    .where(
      and(
        eq(monthlyAllowances.month, allowance.month),
        eq(monthlyAllowances.memberId, allowance.memberId)
      )
    );
  
  if (existing.length > 0) {
    // Update existing record
    await db
      .update(monthlyAllowances)
      .set({ ...allowance, finalAllowance })
      .where(eq(monthlyAllowances.id, existing[0].id));
  } else {
    // Insert new record
    await db
      .insert(monthlyAllowances)
      .values({ ...allowance, finalAllowance });
  }
}

export async function getMonthlyAllowance(month: string, memberId: string) {
  const db = await getDb();
  if (!db) return null;
  
  const result = await db
    .select()
    .from(monthlyAllowances)
    .where(
      and(
        eq(monthlyAllowances.month, month),
        eq(monthlyAllowances.memberId, memberId)
      )
    );
  
  return result[0] || null;
}

export async function getAllMonthlyAllowances(month: string) {
  const db = await getDb();
  if (!db) return [];
  
  const result = await db
    .select()
    .from(monthlyAllowances)
    .where(eq(monthlyAllowances.month, month))
    .orderBy(monthlyAllowances.memberId);
  
  return result;
}

export async function getMemberAllowanceHistory(memberId: string) {
  const db = await getDb();
  if (!db) return [];
  
  const result = await db
    .select()
    .from(monthlyAllowances)
    .where(eq(monthlyAllowances.memberId, memberId))
    .orderBy(desc(monthlyAllowances.month));
  
  return result;
}

// ==================== Bug Report Rewards ====================

export async function createBugReportReward(reward: InsertBugReportReward) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(bugReportRewards).values(reward);
  return result;
}

export async function getAllBugReportRewards() {
  const db = await getDb();
  if (!db) return [];
  
  const result = await db
    .select()
    .from(bugReportRewards)
    .orderBy(desc(bugReportRewards.createdAt));
  
  return result;
}

export async function getBugReportRewardByCommentId(commentId: number) {
  const db = await getDb();
  if (!db) return null;
  
  const result = await db
    .select()
    .from(bugReportRewards)
    .where(eq(bugReportRewards.commentId, commentId));
  
  return result[0] || null;
}

export async function deleteBugReportReward(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db
    .delete(bugReportRewards)
    .where(eq(bugReportRewards.id, id));
  
  return result;
}
