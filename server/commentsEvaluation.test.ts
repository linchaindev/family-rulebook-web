import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createTestContext(): TrpcContext {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "test-user",
    email: "test@example.com",
    name: "Test User",
    loginMethod: "manus",
    role: "user",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  const ctx: TrpcContext = {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };

  return ctx;
}

describe("Comments API", () => {
  it("should create a comment", async () => {
    const ctx = createTestContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.comments.create({
      fromMember: "dad",
      toMember: "mom",
      type: "praise",
      content: "테스트 칭찬 메시지",
      date: "2026-03-01",
    });

    expect(result.success).toBe(true);
  });

  it("should get all comments", async () => {
    const ctx = createTestContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.comments.getAll();

    expect(Array.isArray(result)).toBe(true);
  });

  it("should delete a comment", async () => {
    const ctx = createTestContext();
    const caller = appRouter.createCaller(ctx);

    // First create a comment
    await caller.comments.create({
      fromMember: "jin",
      toMember: "sean",
      type: "suggestion",
      content: "테스트 건의 메시지 삭제용",
      date: "2026-03-01",
    });

    // Get the comment
    const comments = await caller.comments.getAll();
    const comment = comments.find((c: any) => c.content === "테스트 건의 메시지 삭제용");

    if (comment) {
      const result = await caller.comments.delete({ id: comment.id });
      expect(result.success).toBe(true);
    }
  });
});

describe("Manager Evaluation API", () => {
  it("should submit evaluation vote", async () => {
    const ctx = createTestContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.managerEvaluation.submitVote({
      month: "2026-03",
      managerId: "dad",
      voterId: "mom",
      vote: "good",
    });

    expect(result.success).toBe(true);
  });

  it("should get evaluation by month", async () => {
    const ctx = createTestContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.managerEvaluation.getByMonth({
      month: "2026-03",
    });

    expect(Array.isArray(result)).toBe(true);
  });

  it("should get all evaluations", async () => {
    const ctx = createTestContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.managerEvaluation.getAll();

    expect(Array.isArray(result)).toBe(true);
  });

  it("should calculate cumulative stats", async () => {
    const ctx = createTestContext();
    const caller = appRouter.createCaller(ctx);

    // Submit multiple votes for a test month
    await caller.managerEvaluation.submitVote({
      month: "2026-04",
      managerId: "dad",
      voterId: "mom",
      vote: "good",
    });

    await caller.managerEvaluation.submitVote({
      month: "2026-04",
      managerId: "dad",
      voterId: "jin",
      vote: "good",
    });

    await caller.managerEvaluation.submitVote({
      month: "2026-04",
      managerId: "dad",
      voterId: "sean",
      vote: "bad",
    });

    const result = await caller.managerEvaluation.getByMonth({
      month: "2026-04",
    });

    expect(Array.isArray(result)).toBe(true);
    const goodVotes = result.filter((e: any) => e.vote === 'good').length;
    const badVotes = result.filter((e: any) => e.vote === 'bad').length;
    expect(goodVotes).toBeGreaterThanOrEqual(2);
    expect(badVotes).toBeGreaterThanOrEqual(1);
  });
});
