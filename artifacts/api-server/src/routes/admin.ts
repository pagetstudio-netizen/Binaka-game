import { Router } from "express";
import { db } from "@workspace/db";
import { usersTable, transactionsTable, gameHistoryTable, gameConfigTable } from "@workspace/db";
import { eq, sql, desc, like, or, and } from "drizzle-orm";
import { requireAdmin } from "../lib/auth.js";
import { sanitizeUser } from "./auth.js";

const router = Router();

router.get("/stats", requireAdmin, async (req, res) => {
  try {
    const [totalUsers] = await db.select({ count: sql<number>`COUNT(*)` }).from(usersTable);
    const [activeUsers] = await db.select({ count: sql<number>`COUNT(*)` }).from(usersTable).where(eq(usersTable.isBlocked, false));
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const [todaySignups] = await db.select({ count: sql<number>`COUNT(*)` }).from(usersTable).where(sql`created_at >= ${today}`);
    const [totalDep] = await db.select({ total: sql<number>`COALESCE(SUM(CAST(amount AS DECIMAL)), 0)` }).from(transactionsTable).where(and(eq(transactionsTable.type, "deposit"), eq(transactionsTable.status, "completed")));
    const [todayDep] = await db.select({ total: sql<number>`COALESCE(SUM(CAST(amount AS DECIMAL)), 0)` }).from(transactionsTable).where(and(eq(transactionsTable.type, "deposit"), eq(transactionsTable.status, "completed"), sql`created_at >= ${today}`));
    const [totalWith] = await db.select({ total: sql<number>`COALESCE(SUM(CAST(amount AS DECIMAL)), 0)` }).from(transactionsTable).where(and(eq(transactionsTable.type, "withdrawal"), eq(transactionsTable.status, "completed")));
    const [todayWith] = await db.select({ total: sql<number>`COALESCE(SUM(CAST(amount AS DECIMAL)), 0)` }).from(transactionsTable).where(and(eq(transactionsTable.type, "withdrawal"), eq(transactionsTable.status, "completed"), sql`created_at >= ${today}`));
    const [totalGames] = await db.select({ count: sql<number>`COUNT(*)` }).from(gameHistoryTable);
    const [gameLosses] = await db.select({ total: sql<number>`COALESCE(SUM(CAST(amount AS DECIMAL)), 0)` }).from(transactionsTable).where(eq(transactionsTable.type, "game_loss"));
    const [gameWins] = await db.select({ total: sql<number>`COALESCE(SUM(CAST(amount AS DECIMAL)), 0)` }).from(transactionsTable).where(eq(transactionsTable.type, "game_win"));

    return res.json({
      totalUsers: Number(totalUsers.count),
      activeUsers: Number(activeUsers.count),
      totalDeposited: Number(totalDep.total),
      totalWithdrawn: Number(totalWith.total),
      platformRevenue: Number(gameLosses.total) - Number(gameWins.total),
      todaySignups: Number(todaySignups.count),
      todayDeposits: Number(todayDep.total),
      todayWithdrawals: Number(todayWith.total),
      totalGamesPlayed: Number(totalGames.count),
    });
  } catch (err) {
    req.log.error(err);
    return res.status(500).json({ error: "Erreur serveur" });
  }
});

router.get("/users", requireAdmin, async (req, res) => {
  try {
    const search = req.query.search as string | undefined;
    const limit = Math.min(Number(req.query.limit) || 20, 100);
    const offset = Number(req.query.offset) || 0;

    let whereClause = search
      ? or(like(usersTable.fullName, `%${search}%`), like(usersTable.phone, `%${search}%`))
      : undefined;

    const users = whereClause
      ? await db.select().from(usersTable).where(whereClause).orderBy(desc(usersTable.createdAt)).limit(limit).offset(offset)
      : await db.select().from(usersTable).orderBy(desc(usersTable.createdAt)).limit(limit).offset(offset);

    const [countRow] = whereClause
      ? await db.select({ count: sql<number>`COUNT(*)` }).from(usersTable).where(whereClause)
      : await db.select({ count: sql<number>`COUNT(*)` }).from(usersTable);

    return res.json({ users: users.map(sanitizeUser), total: Number(countRow.count) });
  } catch (err) {
    req.log.error(err);
    return res.status(500).json({ error: "Erreur serveur" });
  }
});

router.patch("/users/:id/balance", requireAdmin, async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { amount, operation, note } = req.body;

    if (!amount || !operation) return res.status(400).json({ error: "amount et operation requis" });

    let newBalance;
    if (operation === "add") {
      newBalance = sql`${usersTable.balance} + ${amount}`;
    } else if (operation === "subtract") {
      newBalance = sql`${usersTable.balance} - ${amount}`;
    } else {
      newBalance = amount.toString();
    }

    const [updated] = await db.update(usersTable).set({ balance: newBalance as any }).where(eq(usersTable.id, id)).returning();
    if (!updated) return res.status(404).json({ error: "Utilisateur introuvable" });

    await db.insert(transactionsTable).values({
      userId: id,
      type: operation === "add" ? "bonus" : "withdrawal",
      amount: amount.toString(),
      status: "completed",
      method: "admin",
      note: note || `Ajustement admin (${operation})`,
    });

    return res.json(sanitizeUser(updated));
  } catch (err) {
    req.log.error(err);
    return res.status(500).json({ error: "Erreur serveur" });
  }
});

router.patch("/users/:id/status", requireAdmin, async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { isBlocked } = req.body;

    const [updated] = await db.update(usersTable).set({ isBlocked }).where(eq(usersTable.id, id)).returning();
    if (!updated) return res.status(404).json({ error: "Utilisateur introuvable" });
    return res.json(sanitizeUser(updated));
  } catch (err) {
    req.log.error(err);
    return res.status(500).json({ error: "Erreur serveur" });
  }
});

router.get("/games/config", requireAdmin, async (req, res) => {
  try {
    const configs = await db.select().from(gameConfigTable);
    const result: any = {};
    for (const c of configs) {
      result[c.gameType] = {
        gameType: c.gameType,
        minBet: Number(c.minBet),
        maxBet: Number(c.maxBet),
        rtp: Number(c.rtp),
        winProbability: Number(c.winProbability),
        isActive: c.isActive,
      };
    }
    // Fill defaults if missing
    for (const type of ["slots", "wheel", "scratch"]) {
      if (!result[type]) {
        result[type] = { gameType: type, minBet: 100, maxBet: 50000, rtp: 95, winProbability: 0.35, isActive: true };
      }
    }
    return res.json(result);
  } catch (err) {
    req.log.error(err);
    return res.status(500).json({ error: "Erreur serveur" });
  }
});

router.patch("/games/config", requireAdmin, async (req, res) => {
  try {
    const body = req.body;
    for (const [gameType, cfg] of Object.entries(body) as [string, any][]) {
      const existing = await db.select().from(gameConfigTable).where(eq(gameConfigTable.gameType, gameType)).limit(1);
      if (existing.length > 0) {
        await db.update(gameConfigTable).set({
          minBet: cfg.minBet?.toString(),
          maxBet: cfg.maxBet?.toString(),
          rtp: cfg.rtp?.toString(),
          winProbability: cfg.winProbability?.toString(),
          isActive: cfg.isActive,
          updatedAt: new Date(),
        }).where(eq(gameConfigTable.gameType, gameType));
      } else {
        await db.insert(gameConfigTable).values({
          gameType,
          minBet: cfg.minBet?.toString() || "100",
          maxBet: cfg.maxBet?.toString() || "50000",
          rtp: cfg.rtp?.toString() || "95",
          winProbability: cfg.winProbability?.toString() || "0.35",
          isActive: cfg.isActive !== false,
        });
      }
    }
    // Return updated config
    const configs = await db.select().from(gameConfigTable);
    const result: any = {};
    for (const c of configs) {
      result[c.gameType] = { gameType: c.gameType, minBet: Number(c.minBet), maxBet: Number(c.maxBet), rtp: Number(c.rtp), winProbability: Number(c.winProbability), isActive: c.isActive };
    }
    return res.json(result);
  } catch (err) {
    req.log.error(err);
    return res.status(500).json({ error: "Erreur serveur" });
  }
});

router.get("/transactions", requireAdmin, async (req, res) => {
  try {
    const limit = Math.min(Number(req.query.limit) || 20, 100);
    const offset = Number(req.query.offset) || 0;
    const status = req.query.status as string | undefined;
    const type = req.query.type as string | undefined;

    let where: any = undefined;
    if (status && type) where = and(eq(transactionsTable.status, status), eq(transactionsTable.type, type));
    else if (status) where = eq(transactionsTable.status, status);
    else if (type) where = eq(transactionsTable.type, type);

    const transactions = where
      ? await db.select().from(transactionsTable).where(where).orderBy(desc(transactionsTable.createdAt)).limit(limit).offset(offset)
      : await db.select().from(transactionsTable).orderBy(desc(transactionsTable.createdAt)).limit(limit).offset(offset);

    const [countRow] = where
      ? await db.select({ count: sql<number>`COUNT(*)` }).from(transactionsTable).where(where)
      : await db.select({ count: sql<number>`COUNT(*)` }).from(transactionsTable);

    return res.json({ transactions, total: Number(countRow.count) });
  } catch (err) {
    req.log.error(err);
    return res.status(500).json({ error: "Erreur serveur" });
  }
});

router.patch("/transactions/:id/approve", requireAdmin, async (req, res) => {
  try {
    const id = Number(req.params.id);
    const [tx] = await db.select().from(transactionsTable).where(eq(transactionsTable.id, id)).limit(1);
    if (!tx) return res.status(404).json({ error: "Transaction introuvable" });

    const [updated] = await db.update(transactionsTable).set({ status: "completed" }).where(eq(transactionsTable.id, id)).returning();

    // If deposit, credit user
    if (tx.type === "deposit") {
      await db.update(usersTable).set({ balance: sql`${usersTable.balance} + ${Number(tx.amount)}` }).where(eq(usersTable.id, tx.userId));
    }

    return res.json(updated);
  } catch (err) {
    req.log.error(err);
    return res.status(500).json({ error: "Erreur serveur" });
  }
});

router.patch("/transactions/:id/reject", requireAdmin, async (req, res) => {
  try {
    const id = Number(req.params.id);
    const [tx] = await db.select().from(transactionsTable).where(eq(transactionsTable.id, id)).limit(1);
    if (!tx) return res.status(404).json({ error: "Transaction introuvable" });

    const [updated] = await db.update(transactionsTable).set({ status: "rejected" }).where(eq(transactionsTable.id, id)).returning();

    // If withdrawal, refund user
    if (tx.type === "withdrawal") {
      await db.update(usersTable).set({ balance: sql`${usersTable.balance} + ${Number(tx.amount)}` }).where(eq(usersTable.id, tx.userId));
    }

    return res.json(updated);
  } catch (err) {
    req.log.error(err);
    return res.status(500).json({ error: "Erreur serveur" });
  }
});

export default router;
