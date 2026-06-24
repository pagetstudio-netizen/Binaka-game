import { Router } from "express";
import { db } from "@workspace/db";
import { usersTable, transactionsTable } from "@workspace/db";
import { eq, sql, desc } from "drizzle-orm";
import { requireAuth } from "../lib/auth.js";

const router = Router();

const COMMISSION_RATE = 0.10; // 10%

router.get("/info", requireAuth, async (req, res) => {
  try {
    const userId = (req as any).userId;
    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId)).limit(1);
    if (!user) return res.status(404).json({ error: "Utilisateur introuvable" });

    const [countRow] = await db.select({ count: sql<number>`COUNT(*)` })
      .from(usersTable).where(eq(usersTable.referredBy, userId));

    const [earningsRow] = await db.select({ total: sql<number>`COALESCE(SUM(CAST(amount AS DECIMAL)), 0)` })
      .from(transactionsTable)
      .where(eq(transactionsTable.userId, userId))
      // In a real app, we'd filter by type: referral_commission
      ;

    const host = process.env.APP_URL || "https://binakagame.com";
    return res.json({
      referralCode: user.referralCode,
      referralLink: `${host}/register?ref=${user.referralCode}`,
      totalInvited: Number(countRow.count),
      totalEarned: 0, // tracked via specific transactions
      commissionRate: COMMISSION_RATE,
    });
  } catch (err) {
    req.log.error(err);
    return res.status(500).json({ error: "Erreur serveur" });
  }
});

router.get("/commissions", requireAuth, async (req, res) => {
  try {
    const userId = (req as any).userId;
    // Get referred users
    const referred = await db.select({ id: usersTable.id, fullName: usersTable.fullName })
      .from(usersTable).where(eq(usersTable.referredBy, userId));

    return res.json(referred.map((u, i) => ({
      id: i + 1,
      referredUser: maskName(u.fullName),
      amount: 100, // sample commission
      createdAt: new Date().toISOString(),
    })));
  } catch (err) {
    req.log.error(err);
    return res.status(500).json({ error: "Erreur serveur" });
  }
});

function maskName(name: string): string {
  if (!name) return "Joueur***";
  const parts = name.split(" ");
  return parts[0] + " " + (parts[1] ? parts[1][0] + "***" : "***");
}

export default router;
