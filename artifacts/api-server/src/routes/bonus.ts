import { Router } from "express";
import { db } from "@workspace/db";
import { usersTable, transactionsTable, notificationsTable } from "@workspace/db";
import { eq, sql } from "drizzle-orm";
import { requireAuth } from "../lib/auth.js";

const router = Router();

const VIP_DAILY_BONUS: Record<number, number> = {
  1: 100, 2: 200, 3: 350, 4: 500, 5: 750,
  6: 1000, 7: 1500, 8: 2000, 9: 3000, 10: 5000,
};

router.post("/claim-daily", requireAuth, async (req, res) => {
  try {
    const userId = (req as any).userId;
    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId)).limit(1);
    if (!user) return res.status(404).json({ error: "Utilisateur introuvable" });

    const now = new Date();
    if (user.lastDailyBonus) {
      const lastBonus = new Date(user.lastDailyBonus);
      const hoursSince = (now.getTime() - lastBonus.getTime()) / (1000 * 60 * 60);
      if (hoursSince < 24) {
        return res.status(400).json({ error: "Bonus déjà réclamé aujourd'hui. Revenez dans 24h." });
      }
    }

    const bonusAmount = VIP_DAILY_BONUS[user.vipLevel] || 100;

    await db.update(usersTable).set({
      balance: sql`${usersTable.balance} + ${bonusAmount}`,
      lastDailyBonus: now,
    }).where(eq(usersTable.id, userId));

    await db.insert(transactionsTable).values({
      userId, type: "bonus", amount: bonusAmount.toString(),
      status: "completed", method: "platform", note: `Bonus quotidien VIP ${user.vipLevel}`,
    });

    await db.insert(notificationsTable).values({
      userId, title: "Bonus quotidien reçu !",
      message: `Vous avez reçu ${bonusAmount.toLocaleString()} FCFA de bonus VIP ${user.vipLevel}.`,
      type: "gain",
    });

    const [updated] = await db.select().from(usersTable).where(eq(usersTable.id, userId)).limit(1);
    return res.json({ amount: bonusAmount, newBalance: Number(updated.balance), message: `Bonus de ${bonusAmount} FCFA crédité !` });
  } catch (err) {
    req.log.error(err);
    return res.status(500).json({ error: "Erreur serveur" });
  }
});

router.get("/list", async (_req, res) => {
  return res.json([
    { id: 1, title: "Bonus d'inscription", description: "1 000 FCFA offerts à l'inscription", amount: 1000, type: "inscription", isActive: true },
    { id: 2, title: "Bonus quotidien VIP", description: "Bonus journalier selon votre niveau VIP (100 à 5 000 FCFA)", amount: 100, type: "quotidien", isActive: true },
    { id: 3, title: "Cashback VIP", description: "Récupérez jusqu'à 10% de vos pertes", amount: 0, type: "cashback", isActive: true },
    { id: 4, title: "Bonus de parrainage", description: "Gagnez 10% sur chaque dépôt de vos filleuls", amount: 0, type: "parrainage", isActive: true },
  ]);
});

export default router;
