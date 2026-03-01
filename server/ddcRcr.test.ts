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

describe("DDC Records API", () => {
  it("should create a DDC record", async () => {
    const ctx = createTestContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.ddc.create({
      memberId: "dad",
      date: "2026-02-09",
      screenTime: 120,
    });

    expect(result.success).toBe(true);
  });

  it("should get DDC records by month (getByMonth)", async () => {
    const ctx = createTestContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.ddc.getByMonth({ month: "2026-02" });
    expect(Array.isArray(result)).toBe(true);
  });

  it("should get all DDC records", async () => {
    const ctx = createTestContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.ddc.getAll();
    expect(Array.isArray(result)).toBe(true);
  });

  it("should update a DDC record", async () => {
    const ctx = createTestContext();
    const caller = appRouter.createCaller(ctx);

    // First create a record
    await caller.ddc.create({
      memberId: "dad",
      date: "2026-02-10",
      screenTime: 100,
    });

    // Get the record
    const records = await caller.ddc.getByMonth({ month: "2026-02" });
    const record = records.find((r: any) => r.memberId === "dad" && r.date === "2026-02-10");

    if (record) {
      const result = await caller.ddc.update({
        id: record.id,
        updates: { screenTime: 150 },
      });
      expect(result.success).toBe(true);
    }
  });

  it("should delete a DDC record", async () => {
    const ctx = createTestContext();
    const caller = appRouter.createCaller(ctx);

    // First create a record
    await caller.ddc.create({
      memberId: "dad",
      date: "2026-02-11",
      screenTime: 100,
    });

    // Get the record
    const records = await caller.ddc.getByMonth({ month: "2026-02" });
    const record = records.find((r: any) => r.memberId === "dad" && r.date === "2026-02-11");

    if (record) {
      const result = await caller.ddc.delete({ id: record.id });
      expect(result.success).toBe(true);
    }
  });
});

describe("RCR Records API", () => {
  it("should create an RCR record", async () => {
    const ctx = createTestContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.rcr.create({
      memberId: "mom",
      date: "2026-02-09",
      cardType: "yellow",
      appliedBy: "auditor",
      reason: "테스트 위반",
    });

    expect(result.success).toBe(true);
  });

  it("should get all RCR records", async () => {
    const ctx = createTestContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.rcr.getAll();
    expect(Array.isArray(result)).toBe(true);
  });

  it("should update an RCR record", async () => {
    const ctx = createTestContext();
    const caller = appRouter.createCaller(ctx);

    // First create a record
    await caller.rcr.create({
      memberId: "jin",
      date: "2026-02-10",
      cardType: "red",
      appliedBy: "auditor",
      reason: "테스트 위반",
    });

    // Get the record
    const records = await caller.rcr.getAll();
    const record = records.find((r: any) => r.memberId === "jin" && r.date === "2026-02-10");

    if (record) {
      const result = await caller.rcr.update({
        id: record.id,
        updates: {
          cardType: "double_red",
          appliedBy: "auditor",
          reason: "수정된 위반",
        },
      });
      expect(result.success).toBe(true);
    }
  });

  it("should delete an RCR record", async () => {
    const ctx = createTestContext();
    const caller = appRouter.createCaller(ctx);

    // First create a record
    await caller.rcr.create({
      memberId: "sean",
      date: "2026-02-11",
      cardType: "green",
      appliedBy: "auditor",
      reason: "테스트 보상",
    });

    // Get the record
    const records = await caller.rcr.getAll();
    const record = records.find((r: any) => r.memberId === "sean" && r.date === "2026-02-11");

    if (record) {
      const result = await caller.rcr.delete({ id: record.id });
      expect(result.success).toBe(true);
    }
  });
});
