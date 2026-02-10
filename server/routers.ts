import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { z } from "zod";
import * as db from "./db";
import { generateAndSendPasswords, getCurrentMonth } from "./passwordUtils";

export const appRouter = router({
    // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // DDC Records Router
  ddc: router({
    create: publicProcedure
      .input(z.object({
        date: z.string(),
        memberId: z.string(),
        screenTime: z.number(),
      }))
      .mutation(async ({ input }) => {
        await db.createDDCRecord(input);
        return { success: true };
      }),
    
    createBatch: publicProcedure
      .input(z.object({
        records: z.array(z.object({
          date: z.string(),
          memberId: z.string(),
          screenTime: z.number(),
        })),
      }))
      .mutation(async ({ input }) => {
        for (const record of input.records) {
          await db.createDDCRecord(record);
        }
        return { success: true, count: input.records.length };
      }),
    
    getAll: publicProcedure.query(async () => {
      const records = await db.getAllDDCRecords();
      return records;
    }),
    
    getByMember: publicProcedure
      .input(z.object({ memberId: z.string() }))
      .query(async ({ input }) => {
        const records = await db.getDDCRecordsByMember(input.memberId);
        return records;
      }),
    
    getByMonth: publicProcedure
      .input(z.object({ month: z.string() }))
      .query(async ({ input }) => {
        const records = await db.getDDCRecordsByMonth(input.month);
        return records;
      }),
    
    update: publicProcedure
      .input(z.object({
        id: z.number(),
        updates: z.object({
          date: z.string().optional(),
          memberId: z.string().optional(),
          screenTime: z.number().optional(),
        }),
      }))
      .mutation(async ({ input }) => {
        await db.updateDDCRecord(input.id, input.updates);
        return { success: true };
      }),
    
    delete: publicProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.deleteDDCRecord(input.id);
        return { success: true };
      }),
  }),

  // RCR Records Router
  rcr: router({
    create: publicProcedure
      .input(z.object({
        date: z.string(),
        memberId: z.string(),
        level: z.enum(["minor", "moderate", "major", "maximum"]),
        reason: z.string(),
        appliedBy: z.string(),
      }))
      .mutation(async ({ input }) => {
        await db.createRCRRecord(input);
        return { success: true };
      }),
    
    getAll: publicProcedure.query(async () => {
      const records = await db.getAllRCRRecords();
      return records;
    }),
    
    getByMember: publicProcedure
      .input(z.object({ memberId: z.string() }))
      .query(async ({ input }) => {
        const records = await db.getRCRRecordsByMember(input.memberId);
        return records;
      }),
    
    update: publicProcedure
      .input(z.object({
        id: z.number(),
        updates: z.object({
          date: z.string().optional(),
          memberId: z.string().optional(),
          level: z.enum(["minor", "moderate", "major", "maximum"]).optional(),
          reason: z.string().optional(),
          appliedBy: z.string().optional(),
        }),
      }))
      .mutation(async ({ input }) => {
        await db.updateRCRRecord(input.id, input.updates);
        return { success: true };
      }),
    
    delete: publicProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.deleteRCRRecord(input.id);
        return { success: true };
      }),
  }),

  // Manager Activities Router
  managerActivity: router({
    create: publicProcedure
      .input(z.object({
        month: z.string(),
        managerId: z.string(),
        wakeupCount: z.number().optional(),
        academyCount: z.number().optional(),
        homeworkCount: z.number().optional(),
        sleepCount: z.number().optional(),
        settlementCount: z.number().optional(),
        evaluationCount: z.number().optional(),
        oVotes: z.number().optional(),
        reward: z.number().optional(),
      }))
      .mutation(async ({ input }) => {
        await db.createManagerActivity(input);
        return { success: true };
      }),
    
    getByMonth: publicProcedure
      .input(z.object({
        month: z.string(),
        managerId: z.string(),
      }))
      .query(async ({ input }) => {
        const activity = await db.getManagerActivityByMonth(input.month, input.managerId);
        return activity;
      }),
    
    getAll: publicProcedure.query(async () => {
      const activities = await db.getAllManagerActivities();
      return activities;
    }),
    
    getByManager: publicProcedure
      .input(z.object({ managerId: z.string() }))
      .query(async ({ input }) => {
        const activities = await db.getManagerActivitiesByManager(input.managerId);
        return activities;
      }),
    
    update: publicProcedure
      .input(z.object({
        month: z.string(),
        managerId: z.string(),
        updates: z.object({
          wakeupCount: z.number().optional(),
          academyCount: z.number().optional(),
          homeworkCount: z.number().optional(),
          sleepCount: z.number().optional(),
          settlementCount: z.number().optional(),
          evaluationCount: z.number().optional(),
          oVotes: z.number().optional(),
          reward: z.number().optional(),
        }),
      }))
      .mutation(async ({ input }) => {
        await db.updateManagerActivity(input.month, input.managerId, input.updates);
        return { success: true };
      }),
  }),

  // Password Router
  password: router({  
    verifyManager: publicProcedure
      .input(z.object({
        month: z.string(),
        password: z.string(),
      }))
      .query(async ({ input }) => {
        const isValid = await db.verifyManagerPassword(input.month, input.password);
        return { valid: isValid };
      }),
    
    verifyAuditor: publicProcedure
      .input(z.object({
        month: z.string(),
        password: z.string(),
      }))
      .query(async ({ input }) => {
        const isValid = await db.verifyAuditorPassword(input.month, input.password);
        return { valid: isValid };
      }),
    
    generateForCurrentMonth: publicProcedure
      .mutation(async () => {
        const month = getCurrentMonth();
        const result = await generateAndSendPasswords(month);
        return result;
      }),
  }),

  // Monthly Manager Assignment Router
  monthlyManager: router({
    set: publicProcedure
      .input(z.object({
        month: z.string(),
        managerId: z.string(),
      }))
      .mutation(async ({ input }) => {
        await db.setMonthlyManager(input.month, input.managerId);
        return { success: true };
      }),
    
    get: publicProcedure
      .input(z.object({ month: z.string() }))
      .query(async ({ input }) => {
        const manager = await db.getMonthlyManager(input.month);
        return manager;
      }),
    
    getAll: publicProcedure.query(async () => {
      const managers = await db.getAllMonthlyManagers();
      return managers;
    }),
  }),

  // Manager Evaluation Router
  managerEvaluation: router({
    submitVote: publicProcedure
      .input(z.object({
        month: z.string(),
        managerId: z.string(),
        voterId: z.string(),
        vote: z.enum(["good", "bad"]),
      }))
      .mutation(async ({ input }) => {
        await db.createManagerEvaluation(input);
        return { success: true };
      }),
    
    getByMonth: publicProcedure
      .input(z.object({ month: z.string() }))
      .query(async ({ input }) => {
        const evaluations = await db.getManagerEvaluationsByMonth(input.month);
        return evaluations;
      }),
    
    getAll: publicProcedure.query(async () => {
      const evaluations = await db.getAllManagerEvaluations();
      return evaluations;
    }),
    
    deleteByMonth: publicProcedure
      .input(z.object({ month: z.string() }))
      .mutation(async ({ input }) => {
        await db.deleteManagerEvaluationsByMonth(input.month);
        return { success: true };
      }),
  }),

  // Manager Activity Logs Router
  managerActivityLog: router({
    create: publicProcedure
      .input(z.object({
        date: z.string(),
        memberId: z.string(),
        activityType: z.enum(["tardiness", "absence", "homework_incomplete", "rule_violation", "other"]),
        comment: z.string(),
        recordedBy: z.string(),
      }))
      .mutation(async ({ input }) => {
        await db.createManagerActivityLog(input);
        return { success: true };
      }),
    
    getByMonth: publicProcedure
      .input(z.object({ month: z.string() }))
      .query(async ({ input }) => {
        const logs = await db.getManagerActivityLogsByMonth(input.month);
        return logs;
      }),
    
    getByMember: publicProcedure
      .input(z.object({ memberId: z.string() }))
      .query(async ({ input }) => {
        const logs = await db.getManagerActivityLogsByMember(input.memberId);
        return logs;
      }),
    
    getAll: publicProcedure.query(async () => {
      const logs = await db.getAllManagerActivityLogs();
      return logs;
    }),
    
    update: publicProcedure
      .input(z.object({
        id: z.number(),
        updates: z.object({
          date: z.string().optional(),
          memberId: z.string().optional(),
          activityType: z.enum(["tardiness", "absence", "homework_incomplete", "rule_violation", "other"]).optional(),
          comment: z.string().optional(),
        }),
      }))
      .mutation(async ({ input }) => {
        await db.updateManagerActivityLog(input.id, input.updates);
        return { success: true };
      }),
    
    delete: publicProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.deleteManagerActivityLog(input.id);
        return { success: true };
      }),
  }),

  // Comments Router
  comments: router({
    create: publicProcedure
      .input(z.object({
        type: z.enum(["praise", "suggestion"]),
        fromMember: z.string(),
        toMember: z.string(),
        content: z.string(),
        date: z.string(),
      }))
      .mutation(async ({ input }) => {
        await db.createComment(input);
        return { success: true };
      }),
    
    getAll: publicProcedure.query(async () => {
      const comments = await db.getAllComments();
      return comments;
    }),
    
    getByMember: publicProcedure
      .input(z.object({ memberName: z.string() }))
      .query(async ({ input }) => {
        const comments = await db.getCommentsByMember(input.memberName);
        return comments;
      }),
    
    delete: publicProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.deleteComment(input.id);
        return { success: true };
      }),
  }),
});

export type AppRouter = typeof appRouter;
