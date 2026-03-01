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
        password: z.string(),
      }))
      .query(async ({ input }) => {
        const isValid = await db.verifyAuditorPassword(input.password);
        return { valid: isValid };
      }),
    
    updateAuditor: publicProcedure
      .input(z.object({
        password: z.string().length(6),
      }))
      .mutation(async ({ input }) => {
        await db.updateAuditorPassword(input.password);
        return { success: true };
      }),
    
    getAuditor: publicProcedure.query(async () => {
      const password = await db.getAuditorPassword();
      return { password };
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

    // 평가 완료 후 통합 정산 + 다음달 비밀번호 생성 및 알림 전송
    completeAndSettle: publicProcedure
      .input(z.object({ month: z.string() }))
      .mutation(async ({ input }) => {
        const { month } = input;
        const nextMonth = getNextMonth(month);

        // ===== 1. DDC 정산 =====
        const ddcData = await db.getDDCRecordsByMonth(month);
        const allRcrRecords = (await db.getAllRCRRecords()).filter((r: any) => r.date.startsWith(month));
        const currentAllowances = await db.getAllMonthlyAllowances(month);

        // 구성원별 DDC 총합 계산
        const memberScreenTime = new Map<string, number>();
        ddcData.forEach((r: any) => {
          memberScreenTime.set(r.memberId, (memberScreenTime.get(r.memberId) || 0) + r.screenTime);
        });

        // RCR 스크린타임 조정 (yellow: +5h, green: -1h, double_green: -5h, bug_report: -1h)
        const rcrTimeAdj = new Map<string, number>();
        const rcrMoney = new Map<string, { bonus: number; penalty: number }>();
        allRcrRecords.forEach((rcr: any) => {
          const cur = rcrMoney.get(rcr.memberId) || { bonus: 0, penalty: 0 };
          switch (rcr.cardType) {
            case 'yellow': rcrTimeAdj.set(rcr.memberId, (rcrTimeAdj.get(rcr.memberId) || 0) + 5 * 60); break;
            case 'green': rcrTimeAdj.set(rcr.memberId, (rcrTimeAdj.get(rcr.memberId) || 0) - 1 * 60); break;
            case 'double_green': rcrTimeAdj.set(rcr.memberId, (rcrTimeAdj.get(rcr.memberId) || 0) - 5 * 60); break;
            case 'red': rcrMoney.set(rcr.memberId, { ...cur, penalty: cur.penalty + 1 }); break;
            case 'double_red': rcrMoney.set(rcr.memberId, { ...cur, penalty: cur.penalty + 2 }); break;
            case 'triple_red': rcrMoney.set(rcr.memberId, { ...cur, penalty: cur.penalty + 3 }); break;
            case 'quadro_red': rcrMoney.set(rcr.memberId, { ...cur, penalty: cur.penalty + 4 }); break;
            case 'triple_green': rcrMoney.set(rcr.memberId, { ...cur, bonus: cur.bonus + 2 }); break;
            case 'quadro_green': rcrMoney.set(rcr.memberId, { ...cur, bonus: cur.bonus + 4 }); break;
          }
        });

        // 버그 리포트 보상 (DDC -1시간) 처리
        const bugRewards = await db.getAllBugReportRewards();
        const monthBugRewards = bugRewards.filter((r: any) => r.month === month);
        monthBugRewards.forEach((r: any) => {
          rcrTimeAdj.set(r.memberId, (rcrTimeAdj.get(r.memberId) || 0) - 60); // -1시간
        });

        // 버프/너프 조정 (FA가 직접 입력한 것)
        const adjustments = await db.getAllowanceAdjustmentsByMonth(month);
        const adjMap = new Map<string, number>();
        adjustments.forEach((a: any) => {
          adjMap.set(a.memberId, (adjMap.get(a.memberId) || 0) + a.amount);
        });

        // 최종 스크린타임 계산 및 DDC 순위
        const memberFinal = Array.from(new Set([
          ...Array.from(memberScreenTime.keys()),
          ...currentAllowances.map((a: any) => a.memberId)
        ])).map(memberId => ({
          memberId,
          total: memberScreenTime.get(memberId) || 0,
          adj: rcrTimeAdj.get(memberId) || 0,
          final: (memberScreenTime.get(memberId) || 0) + (rcrTimeAdj.get(memberId) || 0),
        }));
        memberFinal.sort((a, b) => a.final - b.final);

        // ===== 2. 매니저 평가 보상 계산 =====
        // 기본 1만원 + 잘했음 투표 1명당 1만원 (본인 제외 4명 투표, 최대 5만원)
        const managerAssignment = await db.getMonthlyManager(month);
        let managerBonus = 0;
        let managerEvalSummary = null;
        if (managerAssignment) {
          const evaluations = await db.getManagerEvaluationsByMonth(month);
          const goodVotes = evaluations.filter((e: any) => e.vote === 'good').length;
          const badVotes = evaluations.filter((e: any) => e.vote === 'bad').length;
          managerBonus = 1 + goodVotes; // 기본 1만원 + 잘했음 투표 수
          managerEvalSummary = { goodVotes, badVotes, managerId: managerAssignment.managerId, reward: managerBonus };
        }

        // ===== 3. 다음달 용돈 저장 =====
        const settlements: any[] = [];
        for (const member of memberFinal) {
          const rank = memberFinal.findIndex(m => m.memberId === member.memberId) + 1;
          const totalStudents = memberFinal.length;
          // DDC 상금/벌금 규칙: 1등+5만, 2등+3만, 3등0, 4등-3만, 5등-5만
          const DDC_REWARDS: Record<number, number> = { 1: 5, 2: 3, 3: 0, 4: -3, 5: -5 };
          // 인원이 3명이면 1등+5, 2등+3, 3등(최하위)-3으로 조정
          const getDDCReward = (r: number, total: number): number => {
            if (total <= 3) {
              if (r === 1) return 5;
              if (r === 2) return 3;
              return -3; // 최하위
            }
            return DDC_REWARDS[r] ?? 0;
          };
          const ddcReward = getDDCReward(rank, totalStudents);
          const ddcBonus = ddcReward > 0 ? ddcReward : 0;
          const ddcPenalty = ddcReward < 0 ? Math.abs(ddcReward) : 0;
          const rcr = rcrMoney.get(member.memberId) || { bonus: 0, penalty: 0 };
          const adj = adjMap.get(member.memberId) || 0;
          const isManager = managerAssignment?.managerId === member.memberId;
          const extraBonus = (isManager ? managerBonus : 0) + rcr.bonus + ddcBonus + (adj > 0 ? adj : 0);
          const extraPenalty = rcr.penalty + ddcPenalty + (adj < 0 ? Math.abs(adj) : 0);

          const currentAllowance = currentAllowances.find((a: any) => a.memberId === member.memberId);
          const baseAllowance = currentAllowance?.baseAllowance || 0;

          // 세부 내역 문자열 생성
          const bonusParts: string[] = [];
          if (isManager && managerBonus > 0) bonusParts.push(`매니저보상 +${managerBonus}`);
          if (ddcBonus > 0) bonusParts.push(`DDC ${rank}위 +${ddcBonus}`);
          if (rcr.bonus > 0) bonusParts.push(`RCR보너스 +${rcr.bonus}`);
          if (adj > 0) bonusParts.push(`버프 +${adj}`);
          const penaltyParts: string[] = [];
          if (ddcPenalty > 0) penaltyParts.push(`DDC ${rank}위 -${ddcPenalty}`);
          if (rcr.penalty > 0) penaltyParts.push(`RCR 벌금 -${rcr.penalty}`);
          if (adj < 0) penaltyParts.push(`너프 ${adj}`);
          const breakdownFormula = `기본 ${baseAllowance}만원` +
            (bonusParts.length > 0 ? ` + ${bonusParts.join(', ')}` : '') +
            (penaltyParts.length > 0 ? ` - ${penaltyParts.join(', ')}` : '') +
            ` = ${baseAllowance + extraBonus - extraPenalty}만원`;

          await db.upsertMonthlyAllowance({
            month: nextMonth,
            memberId: member.memberId,
            baseAllowance,
            bonus: extraBonus,
            penalty: extraPenalty,
            breakdownFormula,
          });

          settlements.push({
            memberId: member.memberId,
            ddcRank: rank,
            ddcBonus,
            ddcPenalty,
            rcrBonus: rcr.bonus,
            rcrPenalty: rcr.penalty,
            managerBonus: isManager ? managerBonus : 0,
            adjBonus: adj > 0 ? adj : 0,
            adjPenalty: adj < 0 ? Math.abs(adj) : 0,
            baseAllowance,
            finalAllowance: baseAllowance + extraBonus - extraPenalty,
          });
        }

        // ===== 4. 다음달 비밀번호 생성 및 알림 전송 =====
        const newPasswords = await generateAndSendPasswords(nextMonth);
        const nextManager = await db.getMonthlyManager(nextMonth);

        const { notifyOwner } = await import('./_core/notification');
        const settlementSummary = settlements.map(s =>
          `${s.memberId}: 기본 ${s.baseAllowance}만원 + 보너스 ${s.ddcBonus + s.rcrBonus + s.managerBonus + s.adjBonus}만원 - 벌금 ${s.ddcPenalty + s.rcrPenalty + s.adjPenalty}만원 = ${s.finalAllowance}만원`
        ).join('\n');

        await notifyOwner({
          title: `${month} 매니저 평가 완료 + 용돈 정산 완료`,
          content: `✅ ${month} 매니저(${managerAssignment?.managerId || '미지정'}) 평가 완료\n👍 잘했음: ${managerEvalSummary?.goodVotes || 0}표 / 👎 못했음: ${managerEvalSummary?.badVotes || 0}표\n매니저 보상: ${managerBonus}만원\n\n💰 ${nextMonth} 용돈 정산:\n${settlementSummary}\n\n🔐 ${nextMonth} 비밀번호:\n매니저: ${newPasswords?.managerPassword || '생성 실패'}\n감사: ${newPasswords?.auditorPassword || '생성 실패'}\n\n매니저 비밀번호를 ${nextMonth} 매니저(${nextManager?.managerId || '미지정'})에게 전달해주세요.`,
        });

        return {
          success: true,
          nextMonth,
          settlements,
          managerEvaluation: managerEvalSummary,
          managerPassword: newPasswords?.managerPassword,
          auditorPassword: newPasswords?.auditorPassword,
        };
      }),

    // 월말평가 취소 및 정산 롤백
    cancelAndRollback: publicProcedure
      .input(z.object({ month: z.string() }))
      .mutation(async ({ input }) => {
        const { month } = input;
        const nextMonth = getNextMonth(month);

        // 1. 해당 월 매니저 평가 기록 삭제
        await db.deleteManagerEvaluationsByMonth(month);

        // 2. 다음달 용돈 정산 데이터 삭제 (정산으로 생성된 것)
        await db.deleteMonthlyAllowancesByMonth(nextMonth);

        const { notifyOwner } = await import('./_core/notification');
        await notifyOwner({
          title: `${month} 월말평가 취소됨`,
          content: `⚠️ ${month} 월말평가가 취소되었습니다.\n${nextMonth} 용돈 정산 데이터가 삭제되었습니다.\n평가를 다시 진행해주세요.`,
        });

        return { success: true, month, nextMonth };
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
        breakdownFormula: z.string().optional(),
        customMessage: z.string().optional(),
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
          const reward = goodVotes > badVotes ? 1 + goodVotes : 0; // 기본 1만원 + 잘했음 투표 수
          
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
        
        // 1. DDC 1등 먼저 계산
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
        const ddcWinnerId = allMembers[0]?.memberId;
        
        // 2. 매니저 평가 보상 계산
        const managerAssignment = await db.getMonthlyManager(month);
        let managerBonusId: string | null = null;
        let managerBonusAmount = 0;
        
        if (managerAssignment) {
          const evaluations = await db.getManagerEvaluationsByMonth(month);
          const goodVotes = evaluations.filter((e: any) => e.vote === 'good').length;
          const badVotes = evaluations.filter((e: any) => e.vote === 'bad').length;
          
          if (goodVotes > badVotes) {
            managerBonusId = managerAssignment.managerId;
            managerBonusAmount = 1 + goodVotes; // 기본 1만원 + 잘했음 투표당 1만원
          }
        }
        
        // 3. 각 구성원별 한 번에 처리
        for (const allowance of currentAllowances) {
          // RCR 보너스/패널티 계산
          const memberRCR = rcrRecords.filter(r => r.memberId === allowance.memberId);
          let rcrBonus = 0;
          let rcrPenalty = 0;
          const rcrBonusDetails: string[] = [];
          const rcrPenaltyDetails: string[] = [];
          
          memberRCR.forEach(rcr => {
            switch (rcr.cardType) {
              case 'red':
                rcrPenalty += 1;
                rcrPenaltyDetails.push('레드 카드 -1만원');
                break;
              case 'double_red':
                rcrPenalty += 2;
                rcrPenaltyDetails.push('더블 레드 카드 -2만원');
                break;
              case 'triple_red':
                rcrPenalty += 3;
                rcrPenaltyDetails.push('트리플 레드 카드 -3만원');
                break;
              case 'quadro_red':
                rcrPenalty += 4;
                rcrPenaltyDetails.push('쿼드로 레드 카드 -4만원');
                break;
              case 'triple_green':
                rcrBonus += 2;
                rcrBonusDetails.push('트리플 그린 카드 +2만원');
                break;
              case 'quadro_green':
                rcrBonus += 4;
                rcrBonusDetails.push('쿼드로 그린 카드 +4만원');
                break;
            }
          });
          
          // DDC 보너스 계산
          const ddcBonus = allowance.memberId === ddcWinnerId ? 1 : 0;
          const bonusDetails: string[] = [...rcrBonusDetails];
          if (ddcBonus > 0) {
            bonusDetails.push('DDC 1등 상금 +1만원');
          }
          
          // 매니저 보상 계산
          const managerBonus = allowance.memberId === managerBonusId ? managerBonusAmount : 0;
          if (managerBonus > 0) {
            bonusDetails.push(`패밀리 매니저 보상 +${managerBonus}만원`);
          }
          
          // 총 보너스/패널티
          const totalBonus = rcrBonus + ddcBonus + managerBonus;
          const totalPenalty = rcrPenalty;
          
          // breakdownFormula 생성
          const parts: string[] = [`기본 ${allowance.baseAllowance}만원`];
          if (totalBonus > 0) parts.push(`상금 +${totalBonus}만원`);
          if (totalPenalty > 0) parts.push(`벌금 -${totalPenalty}만원`);
          const breakdownFormula = parts.join(' + ');
          
          // customMessage 생성
          const messages: string[] = [];
          if (bonusDetails.length > 0) {
            messages.push('🎉 ' + bonusDetails.join(', '));
          }
          if (rcrPenaltyDetails.length > 0) {
            messages.push('⚠️ ' + rcrPenaltyDetails.join(', '));
          }
          const customMessage = messages.join('\n');
          
          // 한 번에 upsert
          await db.upsertMonthlyAllowance({
            month: nextMonth,
            memberId: allowance.memberId,
            baseAllowance: allowance.baseAllowance,
            bonus: totalBonus,
            penalty: totalPenalty,
            breakdownFormula,
            customMessage: customMessage || null,
          });
        }
        
        return { success: true };
      }),
    
    updateAllowance: publicProcedure
      .input(z.object({
        month: z.string(),
        memberId: z.string(),
        baseAllowance: z.number().optional(),
        bonus: z.number().optional(),
        penalty: z.number().optional(),
        finalAllowance: z.number(),
        breakdownFormula: z.string().optional(),
        customMessage: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const { month, memberId, ...updates } = input;
        await db.updateMonthlyAllowanceFields(month, memberId, updates);
        return { success: true };
      }),
  }),

  // Allowance Adjustments Router (버프/너프)
  allowanceAdjustment: router({
    create: publicProcedure
      .input(z.object({
        month: z.string(),
        memberId: z.string(),
        amount: z.number(), // 양수=버프, 음수=너프 (만원 단위)
        message: z.string(),
        createdBy: z.string(),
      }))
      .mutation(async ({ input }) => {
        await db.createAllowanceAdjustment(input);
        return { success: true };
      }),
    
    getByMonth: publicProcedure
      .input(z.object({ month: z.string() }))
      .query(async ({ input }) => {
        return await db.getAllowanceAdjustmentsByMonth(input.month);
      }),
    
    getByMemberAndMonth: publicProcedure
      .input(z.object({ memberId: z.string(), month: z.string() }))
      .query(async ({ input }) => {
        return await db.getAllowanceAdjustmentsByMemberAndMonth(input.memberId, input.month);
      }),
    
    delete: publicProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.deleteAllowanceAdjustment(input.id);
        return { success: true };
      }),
  }),

  // App Settings Router
  appSettings: router({
    get: publicProcedure
      .input(z.object({ key: z.string() }))
      .query(async ({ input }) => {
        const value = await db.getAppSetting(input.key);
        return { value };
      }),
    
    getAll: publicProcedure.query(async () => {
      return await db.getAllAppSettings();
    }),
    
    set: publicProcedure
      .input(z.object({ key: z.string(), value: z.string() }))
      .mutation(async ({ input }) => {
        await db.setAppSetting(input.key, input.value);
        return { success: true };
      }),
    
    // 비밀번호 직접 수정
    updatePassword: publicProcedure
      .input(z.object({
        month: z.string(),
        managerPassword: z.string(),
      }))
      .mutation(async ({ input }) => {
        await db.upsertPassword(input.month, input.managerPassword);
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
