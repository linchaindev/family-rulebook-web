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
      fromMemberId: "dad",
      toMemberId: "mom",
      type: "praise",
      content: "테스트 칭찬 메시지",
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
      fromMemberId: "jin",
      toMemberId: "sean",
      type: "suggestion",
      content: "테스트 건의 메시지",
    });

    // Get the comment
    const comments = await caller.comments.getAll();
    const comment = comments.find(c => c.content === "테스트 건의 메시지");

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

    const result = await caller.evaluation.submitVote({
      year: 2026,
      month: "03",
      managerId: "dad",
      voterId: "mom",
      rating: "good",
    });

    expect(result.success).toBe(true);
  });

  it("should get evaluation by month", async () => {
    const ctx = createTestContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.evaluation.getByMonth({
      year: 2026,
      month: "03",
    });

    expect(result).toBeDefined();
  });

  it("should get all evaluations", async () => {
    const ctx = createTestContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.evaluation.getAll();

    expect(Array.isArray(result)).toBe(true);
  });

  it("should calculate cumulative stats", async () => {
    const ctx = createTestContext();
    const caller = appRouter.createCaller(ctx);

    // Submit multiple votes
    await caller.evaluation.submitVote({
      year: 2026,
      month: "03",
      managerId: "dad",
      voterId: "mom",
      rating: "good",
    });

    await caller.evaluation.submitVote({
      year: 2026,
      month: "03",
      managerId: "dad",
      voterId: "jin",
      rating: "good",
    });

    await caller.evaluation.submitVote({
      year: 2026,
      month: "03",
      managerId: "dad",
      voterId: "sean",
      rating: "bad",
    });

    await caller.evaluation.submitVote({
      year: 2026,
      month: "03",
      managerId: "dad",
      voterId: "liam",
      rating: "good",
    });

    const result = await caller.evaluation.getByMonth({
      year: 2026,
      month: "03",
    });

    expect(result).toBeDefined();
    expect(result?.totalVotes).toBe(4);
    expect(result?.goodVotes).toBe(3);
    expect(result?.badVotes).toBe(1);
  });
});
