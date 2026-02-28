import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { z } from "zod";
import * as db from "./db";
import { generateAndSendPasswords, getCurrentMonth } from "./passwordUtils";

// Helper function to get next month
function getNextMonth(month: string): string {
  const [year, monthNum] = month.split('-').map(Number);
  const nextDate = new Date(year, monthNum, 1); // monthNum is already 1-indexed
  return `${nextDate.getFullYear()}-${String(nextDate.getMonth() + 1).padStart(2, '0')}`;
}

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
        let successCount = 0;
        
        for (const record of input.records) {
          // createDDCRecord uses INSERT ... ON DUPLICATE KEY UPDATE
          // so duplicates are automatically handled as updates
          await db.createDDCRecord(record);
          successCount++;
        }
        
        return { 
          success: true, 
          count: successCount,
          duplicates: 0,
          message: `${successCount}개 저장`
        };
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

  // RCR Records Router - 10단계 카드 시스템
  rcr: router({
    create: publicProcedure
      .input(z.object({
        date: z.string(),
        memberId: z.string(),
        cardType: z.enum(["yellow", "red", "double_red", "triple_red", "quadro_red", "green", "double_green", "triple_green", "quadro_green", "golden"]),
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
          cardType: z.enum(["yellow", "red", "double_red", "triple_red", "quadro_red", "green", "double_green", "triple_green", "quadro_green", "golden"]).optional(),
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

  // Monthly Allowances Router
  allowance: router({
    upsert: publicProcedure
      .input(z.object({
        month: z.string(),
        memberId: z.string(),
        baseAllowance: z.number(),
        bonus: z.number().default(0),
        penalty: z.number().default(0),
      }))
      .mutation(async ({ input }) => {
        await db.upsertMonthlyAllowance(input);
        return { success: true };
      }),
    
    getByMonth: publicProcedure
      .input(z.object({ month: z.string(), memberId: z.string() }))
      .query(async ({ input }) => {
        const allowance = await db.getMonthlyAllowance(input.month, input.memberId);
        return allowance;
      }),
    
    getAllByMonth: publicProcedure
      .input(z.object({ month: z.string() }))
      .query(async ({ input }) => {
        const allowances = await db.getAllMonthlyAllowances(input.month);
        return allowances;
      }),
    
    getHistory: publicProcedure
      .input(z.object({ memberId: z.string() }))
      .query(async ({ input }) => {
        const history = await db.getMemberAllowanceHistory(input.memberId);
        return history;
      }),
    
    autoSettle: publicProcedure
      .input(z.object({ 
        currentMonth: z.string(),
        nextMonth: z.string(),
      }))
      .mutation(async ({ input }) => {
        const { currentMonth, nextMonth } = input;
        
        // 1. 현재 월 DDC 데이터 가져오기
        const ddcRecords = await db.getAllDDCRecords();
        const currentMonthDDC = ddcRecords.filter(r => r.date.startsWith(currentMonth));
        
        // 2. 현재 월 RCR 데이터 가져오기
        const rcrRecords = await db.getAllRCRRecords();
        const currentMonthRCR = rcrRecords.filter(r => r.date.startsWith(currentMonth));
        
        // 3. 각 구성원별 DDC 순위 계산
        const memberTotals = new Map<string, number>();
        currentMonthDDC.forEach(record => {
          const current = memberTotals.get(record.memberId) || 0;
          memberTotals.set(record.memberId, current + record.screenTime);
        });
        
        // 순위 정렬
        const rankings = Array.from(memberTotals.entries())
          .map(([memberId, total]) => ({ memberId, total }))
          .sort((a, b) => a.total - b.total);
        
        // 4. 각 구성원별 상금/벌금 계산
        const settlements = new Map<string, { bonus: number; penalty: number }>();
        
        // DDC 1등 상금 (1만원)
        if (rankings.length > 0) {
          const firstPlace = rankings[0].memberId;
          settlements.set(firstPlace, { bonus: 1, penalty: 0 });
        }
        
        // RCR 10단계 카드 시스템 처리
        // 벌칙 카드: yellow(+5시간), red(-1만원), double_red(-2만원), triple_red(-3만원), quadro_red(-4만원)
        // 보상 카드: green(-1시간), double_green(-5시간), triple_green(+2만원), quadro_green(+4만원), golden(매니저 면제)
        // 월말 평가에서만 일괄 반영
        currentMonthRCR.forEach(rcr => {
          const current = settlements.get(rcr.memberId) || { bonus: 0, penalty: 0 };
          let bonusAmount = 0;
          let penaltyAmount = 0;
          
          switch (rcr.cardType) {
            // 벌칙 카드 (용돀 감소)
            case 'red':
              penaltyAmount = 1;
              break;
            case 'double_red':
              penaltyAmount = 2;
              break;
            case 'triple_red':
              penaltyAmount = 3;
              break;
            case 'quadro_red':
              penaltyAmount = 4;
              break;
            // 보상 카드 (용돀 증가)
            case 'triple_green':
              bonusAmount = 2;
              break;
            case 'quadro_green':
              bonusAmount = 4;
              break;
            // yellow, green, double_green, golden은 DDC 스크린타임이나 매니저 면제로 처리 (용돀 미반영)
          }
          
          settlements.set(rcr.memberId, {
            bonus: current.bonus + bonusAmount,
            penalty: current.penalty + penaltyAmount,
          });
        });
        
        // 5. 다음달 용돈에 반영
        const currentAllowances = await db.getAllMonthlyAllowances(currentMonth);
        
        for (const allowance of currentAllowances) {
          const settlement = settlements.get(allowance.memberId) || { bonus: 0, penalty: 0 };
          
          await db.upsertMonthlyAllowance({
            month: nextMonth,
            memberId: allowance.memberId,
            baseAllowance: allowance.baseAllowance, // 기본 용돈 유지
            bonus: settlement.bonus,
            penalty: settlement.penalty,
          });
        }
        
        return { 
          success: true, 
          settlements: Array.from(settlements.entries()).map(([memberId, data]) => ({
            memberId,
            ...data,
          })),
        };
      }),
  }),

  // Settlement Router - 월말 정산
  settlement: router({
    getMonthData: publicProcedure
      .input(z.object({ month: z.string() }))
      .query(async ({ input }) => {
        const { month } = input;
        
        // 1. DDC 데이터 가져오기
        const ddcRecords = await db.getDDCRecordsByMonth(month);
        
        // 2. RCR 데이터 가져오기
        const allRcrRecords = await db.getAllRCRRecords();
        const rcrRecords = allRcrRecords.filter(r => r.date.startsWith(month));
        
        // 3. 각 구성원별 총 스크린타임 계산
        const memberScreenTime = new Map<string, number>();
        ddcRecords.forEach(record => {
          const current = memberScreenTime.get(record.memberId) || 0;
          memberScreenTime.set(record.memberId, current + record.screenTime);
        });
        
        // 4. RCR 조정 계산 (yellow: +5h, green: -1h, double_green: -5h)
        const rcrAdjustments = new Map<string, number>();
        rcrRecords.forEach(rcr => {
          const current = rcrAdjustments.get(rcr.memberId) || 0;
          let adjustment = 0;
          
          switch (rcr.cardType) {
            case 'yellow':
              adjustment = 5 * 60; // +5시간 (분 단위)
              break;
            case 'green':
              adjustment = -1 * 60; // -1시간
              break;
            case 'double_green':
              adjustment = -5 * 60; // -5시간
              break;
          }
          
          rcrAdjustments.set(rcr.memberId, current + adjustment);
        });
        
        // 5. 최종 스크린타임 계산 및 순위 결정
        const memberFinalTimes = new Map<string, { total: number; adjustment: number; final: number }>();
        memberScreenTime.forEach((time, memberId) => {
          const adjustment = rcrAdjustments.get(memberId) || 0;
          memberFinalTimes.set(memberId, {
            total: time,
            adjustment,
            final: time + adjustment,
          });
        });
        
        // 순위 계산
        const rankings = Array.from(memberFinalTimes.entries())
          .map(([memberId, data]) => ({ memberId, ...data }))
          .sort((a, b) => a.final - b.final);
        
        // 6. RCR 보상/패널티 계산
        const rcrRewards = new Map<string, { bonus: number; penalty: number }>();
        rcrRecords.forEach(rcr => {
          const current = rcrRewards.get(rcr.memberId) || { bonus: 0, penalty: 0 };
          let bonus = 0;
          let penalty = 0;
          
          switch (rcr.cardType) {
            case 'red':
              penalty = 1;
              break;
            case 'double_red':
              penalty = 2;
              break;
            case 'triple_red':
              penalty = 3;
              break;
            case 'quadro_red':
              penalty = 4;
              break;
            case 'triple_green':
              bonus = 2;
              break;
            case 'quadro_green':
              bonus = 4;
              break;
          }
          
          rcrRewards.set(rcr.memberId, {
            bonus: current.bonus + bonus,
            penalty: current.penalty + penalty,
          });
        });
        
        // 7. 용돈 데이터 가져오기
        const allowances = await db.getAllMonthlyAllowances(month);
        
        // 8. 각 구성원별 정산 데이터 구성
        const members = rankings.map((rank, index) => {
          const allowance = allowances.find(a => a.memberId === rank.memberId);
          const rcrReward = rcrRewards.get(rank.memberId) || { bonus: 0, penalty: 0 };
          const ddcBonus = index === 0 ? 1 : 0; // 1등만 1만원
          
          return {
            memberId: rank.memberId,
            totalScreenTime: rank.total,
            rcrAdjustment: rank.adjustment,
            finalScreenTime: rank.final,
            ddcRank: index + 1,
            baseAllowance: allowance?.baseAllowance || 0,
            ddcBonus,
            rcrBonus: rcrReward.bonus,
            rcrPenalty: rcrReward.penalty,
            finalAllowance: (allowance?.baseAllowance || 0) + ddcBonus + rcrReward.bonus - rcrReward.penalty,
          };
        });
        
        // 9. 매니저 평가 데이터
        const managerAssignment = await db.getMonthlyManager(month);
        let managerEvaluation = null;
        
        if (managerAssignment) {
          const evaluations = await db.getManagerEvaluationsByMonth(month);
          const goodVotes = evaluations.filter((e: any) => e.vote === 'good').length;
          const badVotes = evaluations.filter((e: any) => e.vote === 'bad').length;
          const reward = goodVotes > badVotes ? 1 : 0; // 잘했음이 많으면 1만원
          
          managerEvaluation = {
            managerId: managerAssignment.managerId,
            goodVotes,
            badVotes,
            reward,
          };
        }
        
        // 10. 정산 처리 여부 확인 (다음 달 용돈이 이미 생성되었는지)
        const nextMonth = getNextMonth(month);
        const nextMonthAllowances = await db.getAllMonthlyAllowances(nextMonth);
        const isProcessed = nextMonthAllowances.length > 0;
        
        return {
          members,
          managerEvaluation,
          isProcessed,
        };
      }),
    
    processMonthEnd: publicProcedure
      .input(z.object({ month: z.string() }))
      .mutation(async ({ input }) => {
        const { month } = input;
        const nextMonth = getNextMonth(month);
        
        // 정산 데이터 가져오기
        const settlementData = await db.getDDCRecordsByMonth(month);
        const rcrRecords = (await db.getAllRCRRecords()).filter(r => r.date.startsWith(month));
        const currentAllowances = await db.getAllMonthlyAllowances(month);
        
        // 각 구성원별 처리
        for (const allowance of currentAllowances) {
          // DDC 계산
          const memberDDC = settlementData.filter(r => r.memberId === allowance.memberId);
          const totalScreenTime = memberDDC.reduce((sum, r) => sum + r.screenTime, 0);
          
          // RCR 조정
          const memberRCR = rcrRecords.filter(r => r.memberId === allowance.memberId);
          let rcrAdjustment = 0;
          let rcrBonus = 0;
          let rcrPenalty = 0;
          
          memberRCR.forEach(rcr => {
            switch (rcr.cardType) {
              case 'yellow':
                rcrAdjustment += 5 * 60;
                break;
              case 'green':
                rcrAdjustment -= 1 * 60;
                break;
              case 'double_green':
                rcrAdjustment -= 5 * 60;
                break;
              case 'red':
                rcrPenalty += 1;
                break;
              case 'double_red':
                rcrPenalty += 2;
                break;
              case 'triple_red':
                rcrPenalty += 3;
                break;
              case 'quadro_red':
                rcrPenalty += 4;
                break;
              case 'triple_green':
                rcrBonus += 2;
                break;
              case 'quadro_green':
                rcrBonus += 4;
                break;
            }
          });
          
          // 순위 계산을 위한 최종 스크린타임
          const finalScreenTime = totalScreenTime + rcrAdjustment;
          
          // DDC 1등 보너스는 모든 구성원 계산 후 결정해야 하므로 나중에 처리
          // 일단 기본 용돈 + RCR 보상/패널티만 반영
          await db.upsertMonthlyAllowance({
            month: nextMonth,
            memberId: allowance.memberId,
            baseAllowance: allowance.baseAllowance,
            bonus: rcrBonus,
            penalty: rcrPenalty,
          });
        }
        
        // DDC 1등 계산
        const allMembers = currentAllowances.map(a => {
          const memberDDC = settlementData.filter(r => r.memberId === a.memberId);
          const totalScreenTime = memberDDC.reduce((sum, r) => sum + r.screenTime, 0);
          const memberRCR = rcrRecords.filter(r => r.memberId === a.memberId);
          let rcrAdjustment = 0;
          memberRCR.forEach(rcr => {
            if (rcr.cardType === 'yellow') rcrAdjustment += 5 * 60;
            if (rcr.cardType === 'green') rcrAdjustment -= 1 * 60;
            if (rcr.cardType === 'double_green') rcrAdjustment -= 5 * 60;
          });
          return {
            memberId: a.memberId,
            finalScreenTime: totalScreenTime + rcrAdjustment,
          };
        });
        
        allMembers.sort((a, b) => a.finalScreenTime - b.finalScreenTime);
        const firstPlace = allMembers[0];
        
        // 1등에게 보너스 추가
        const firstPlaceAllowance = await db.getMonthlyAllowance(nextMonth, firstPlace.memberId);
        if (firstPlaceAllowance) {
          await db.upsertMonthlyAllowance({
            month: nextMonth,
            memberId: firstPlace.memberId,
            baseAllowance: firstPlaceAllowance.baseAllowance,
            bonus: firstPlaceAllowance.bonus + 1, // DDC 1등 보너스 1만원
            penalty: firstPlaceAllowance.penalty,
          });
        }
        
        // 매니저 평가 보상 처리
        const managerAssignment = await db.getMonthlyManager(month);
        if (managerAssignment) {
          const evaluations = await db.getManagerEvaluationsByMonth(month);
          const goodVotes = evaluations.filter((e: any) => e.vote === 'good').length;
          const badVotes = evaluations.filter((e: any) => e.vote === 'bad').length;
          
          if (goodVotes > badVotes) {
            const managerAllowance = await db.getMonthlyAllowance(nextMonth, managerAssignment.managerId);
            if (managerAllowance) {
              await db.upsertMonthlyAllowance({
                month: nextMonth,
                memberId: managerAssignment.managerId,
                baseAllowance: managerAllowance.baseAllowance,
                bonus: managerAllowance.bonus + 1, // 매니저 보상 1만원
                penalty: managerAllowance.penalty,
              });
            }
          }
        }
        
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
