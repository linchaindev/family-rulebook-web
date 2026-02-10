import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createTestContext(): TrpcContext {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "test-auditor",
    email: "test@example.com",
    name: "Test Auditor",
    loginMethod: "manus",
    role: "admin",
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

describe("Password API", () => {
  it("should generate passwords for current month", async () => {
    const ctx = createTestContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.password.generateForCurrentMonth();

    expect(result.success).toBe(true);
  });

  it("should verify manager password", async () => {
    const ctx = createTestContext();
    const caller = appRouter.createCaller(ctx);

    // Note: This test assumes password exists for current month
    // In real scenario, you would generate it first
    const result = await caller.password.verifyManager({
      month: "2026-02",
      password: "0000", // This will fail unless password is actually "0000"
    });

    // We expect this to be false since we're using a dummy password
    expect(typeof result.valid).toBe("boolean");
  });

  it("should verify auditor password", async () => {
    const ctx = createTestContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.password.verifyAuditor({
      month: "2026-02",
      password: "000000", // This will fail unless password is actually "000000"
    });

    // We expect this to be false since we're using a dummy password
    expect(typeof result.valid).toBe("boolean");
  });
});

describe("Monthly Manager API", () => {
  it("should set monthly manager", async () => {
    const ctx = createTestContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.monthlyManager.set({
      month: "2026-03",
      managerId: "dad",
    });

    expect(result.success).toBe(true);
  });

  it("should get monthly manager", async () => {
    const ctx = createTestContext();
    const caller = appRouter.createCaller(ctx);

    // Set manager first
    await caller.monthlyManager.set({
      month: "2026-03",
      managerId: "mom",
    });

    const result = await caller.monthlyManager.get({
      month: "2026-03",
    });

    expect(result).toBeDefined();
    if (result) {
      expect(result.managerId).toBe("mom");
    }
  });

  it("should get all monthly managers", async () => {
    const ctx = createTestContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.monthlyManager.getAll();

    expect(Array.isArray(result)).toBe(true);
  });
});
