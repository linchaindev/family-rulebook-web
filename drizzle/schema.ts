import { int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// DDC Records Table
export const ddcRecords = mysqlTable("ddc_records", {
  id: int("id").autoincrement().primaryKey(),
  date: varchar("date", { length: 10 }).notNull(), // YYYY-MM-DD
  memberId: varchar("member_id", { length: 20 }).notNull(),
  screenTime: int("screen_time").notNull(), // in minutes
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

export type DDCRecord = typeof ddcRecords.$inferSelect;
export type InsertDDCRecord = typeof ddcRecords.$inferInsert;

// RCR Records Table
export const rcrRecords = mysqlTable("rcr_records", {
  id: int("id").autoincrement().primaryKey(),
  date: varchar("date", { length: 10 }).notNull(), // YYYY-MM-DD
  memberId: varchar("member_id", { length: 20 }).notNull(),
  level: mysqlEnum("level", ["minor", "moderate", "major", "maximum"]).notNull(),
  reason: text("reason").notNull(),
  appliedBy: varchar("applied_by", { length: 50 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

export type RCRRecord = typeof rcrRecords.$inferSelect;
export type InsertRCRRecord = typeof rcrRecords.$inferInsert;

// Manager Activities Table
export const managerActivities = mysqlTable("manager_activities", {
  id: int("id").autoincrement().primaryKey(),
  month: varchar("month", { length: 7 }).notNull(), // YYYY-MM
  managerId: varchar("manager_id", { length: 20 }).notNull(),
  wakeupCount: int("wakeup_count").default(0).notNull(),
  academyCount: int("academy_count").default(0).notNull(),
  homeworkCount: int("homework_count").default(0).notNull(),
  sleepCount: int("sleep_count").default(0).notNull(),
  settlementCount: int("settlement_count").default(0).notNull(),
  evaluationCount: int("evaluation_count").default(0).notNull(),
  oVotes: int("o_votes").default(0).notNull(),
  reward: int("reward").default(0).notNull(), // in 만원
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

export type ManagerActivity = typeof managerActivities.$inferSelect;
export type InsertManagerActivity = typeof managerActivities.$inferInsert;

// Comments Table
export const familyComments = mysqlTable("family_comments", {
  id: int("id").autoincrement().primaryKey(),
  type: mysqlEnum("type", ["praise", "suggestion"]).notNull(),
  fromMember: varchar("from_member", { length: 50 }).notNull(),
  toMember: varchar("to_member", { length: 50 }).notNull(),
  content: text("content").notNull(),
  date: varchar("date", { length: 10 }).notNull(), // YYYY-MM-DD
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

export type FamilyComment = typeof familyComments.$inferSelect;
export type InsertFamilyComment = typeof familyComments.$inferInsert;

// Passwords Table
export const passwords = mysqlTable("passwords", {
  id: int("id").autoincrement().primaryKey(),
  month: varchar("month", { length: 7 }).notNull().unique(), // YYYY-MM
  managerPassword: varchar("manager_password", { length: 4 }).notNull(), // 4-digit
  auditorPassword: varchar("auditor_password", { length: 6 }).notNull(), // 6-digit
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

export type Password = typeof passwords.$inferSelect;
export type InsertPassword = typeof passwords.$inferInsert;