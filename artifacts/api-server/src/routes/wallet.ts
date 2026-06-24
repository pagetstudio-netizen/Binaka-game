import { Router } from "express";
import { db } from "@workspace/db";
import { usersTable, transactionsTable } from "@workspace/db";
import { eq, and, sql, desc } from "drizzle-orm";
import { requireAuth } from "../lib/auth.js";
import { nanoid } from "../lib/nanoid.js";

const router = Router();

router.get("/balance", requireAuth, async (req, res) => {
  try {
    const userId = (req as any).userId;
    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId)).limit(1);
    if (!user) return res.status(404).json({ error: "Utilisateur introuvable" });

    const stats = await db.select({
      type: transactionsTable.type,
      total: sql<number>`SUM(CAST(${transactionsTable.amount} AS DECIMAL))`,
    })
      .from(transactionsTable)
      .where(and(eq(transactionsTable.userId, userId), eq(transactionsTable.status, "completed")))
      .groupBy(transactionsTable.type);

    let totalDeposited = 0, totalWithdrawn = 0, totalWon = 0, totalBet = 0;
    for (const s of stats) {
      if (s.type === "deposit") totalDeposited = Number(s.total);
      if (s.type === "withdrawal") totalWithdrawn = Number(s.total);
      if (s.type === "game_win") totalWon = Number(s.total);
      if (s.type === "game_loss") totalBet = Number(s.total);
    }

    const pending = await db.select({
      type: transactionsTable.type,
      total: sql<number>`SUM(CAST(${transactionsTable.amount} AS DECIMAL))`,
    })
      .from(transactionsTable)
      .where(and(eq(transactionsTable.userId, userId), eq(transactionsTable.status, "pending")))
      .groupBy(transactionsTable.type);

    let pendingDeposits = 0, pendingWithdrawals = 0;
    for (const p of pending) {
      if (p.type === "deposit") pendingDeposits = Number(p.total);
      if (p.type === "withdrawal") pendingWithdrawals = Number(p.total);
    }

    return res.json({
      balance: Number(user.balance),
      totalDeposited,
      totalWithdrawn,
      totalWon,
      totalBet,
      pendingDeposits,
      pendingWithdrawals,
    });
  } catch (err) {
    req.log.error(err);
    return res.status(500).json({ error: "Erreur serveur" });
  }
});

router.get("/transactions", requireAuth, async (req, res) => {
  try {
    const userId = (req as any).userId;
    const limit = Math.min(Number(req.query.limit) || 20, 100);
    const offset = Number(req.query.offset) || 0;
    const type = req.query.type as string | undefined;

    let query = db.select().from(transactionsTable).where(
      type
        ? and(eq(transactionsTable.userId, userId), eq(transactionsTable.type, type))
        : eq(transactionsTable.userId, userId)
    ).orderBy(desc(transactionsTable.createdAt)).limit(limit).offset(offset);

    const transactions = await query;
    const [countRow] = await db.select({ count: sql<number>`COUNT(*)` })
      .from(transactionsTable)
      .where(type
        ? and(eq(transactionsTable.userId, userId), eq(transactionsTable.type, type))
        : eq(transactionsTable.userId, userId));

    return res.json({ transactions, total: Number(countRow.count) });
  } catch (err) {
    req.log.error(err);
    return res.status(500).json({ error: "Erreur serveur" });
  }
});

router.post("/deposit", requireAuth, async (req, res) => {
  try {
    const userId = (req as any).userId;
    const { amount, method, phone, walletAddress } = req.body;

    if (!amount || amount < 500) {
      return res.status(400).json({ error: "Montant minimum: 500 FCFA" });
    }
    if (!method) return res.status(400).json({ error: "Méthode requise" });

    const reference = nanoid(12);
    const [transaction] = await db.insert(transactionsTable).values({
      userId,
      type: "deposit",
      amount: amount.toString(),
      status: "pending",
      method,
      reference,
      note: phone || walletAddress || null,
    }).returning();

    // Auto-approve for demo purposes (simulate payment validation)
    await db.update(transactionsTable).set({ status: "completed" }).where(eq(transactionsTable.id, transaction.id));
    await db.update(usersTable).set({ balance: sql`${usersTable.balance} + ${amount}` }).where(eq(usersTable.id, userId));

    const updated = await db.select().from(transactionsTable).where(eq(transactionsTable.id, transaction.id)).limit(1);
    return res.status(201).json(updated[0]);
  } catch (err) {
    req.log.error(err);
    return res.status(500).json({ error: "Erreur serveur" });
  }
});

router.post("/withdraw", requireAuth, async (req, res) => {
  try {
    const userId = (req as any).userId;
    const { amount, method, phone, walletAddress } = req.body;

    if (!amount || amount < 1000) {
      return res.status(400).json({ error: "Retrait minimum: 1 000 FCFA" });
    }

    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId)).limit(1);
    if (!user || Number(user.balance) < amount) {
      return res.status(400).json({ error: "Solde insuffisant" });
    }

    const reference = nanoid(12);
    const [transaction] = await db.insert(transactionsTable).values({
      userId,
      type: "withdrawal",
      amount: amount.toString(),
      status: "pending",
      method,
      reference,
      note: phone || walletAddress || null,
    }).returning();

    await db.update(usersTable).set({ balance: sql`${usersTable.balance} - ${amount}` }).where(eq(usersTable.id, userId));

    return res.status(201).json(transaction);
  } catch (err) {
    req.log.error(err);
    return res.status(500).json({ error: "Erreur serveur" });
  }
});

export default router;
