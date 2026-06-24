import { Router } from "express";
import { db } from "@workspace/db";
import { usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { requireAuth } from "../lib/auth.js";

const router = Router();

const VIP_LEVELS = [
  { level: 1, name: "Bronze", dailyBonus: 100, cashbackRate: 0, maxWithdrawal: 50000, badge: "🥉", minXp: 0 },
  { level: 2, name: "Argent", dailyBonus: 200, cashbackRate: 1, maxWithdrawal: 100000, badge: "🥈", minXp: 500 },
  { level: 3, name: "Or", dailyBonus: 350, cashbackRate: 2, maxWithdrawal: 200000, badge: "🥇", minXp: 1500 },
  { level: 4, name: "Platine", dailyBonus: 500, cashbackRate: 3, maxWithdrawal: 500000, badge: "💎", minXp: 3000 },
  { level: 5, name: "Diamant", dailyBonus: 750, cashbackRate: 4, maxWithdrawal: 1000000, badge: "👑", minXp: 6000 },
  { level: 6, name: "Saphir", dailyBonus: 1000, cashbackRate: 5, maxWithdrawal: 2000000, badge: "🔵", minXp: 10000 },
  { level: 7, name: "Émeraude", dailyBonus: 1500, cashbackRate: 6, maxWithdrawal: 5000000, badge: "🟢", minXp: 20000 },
  { level: 8, name: "Rubis", dailyBonus: 2000, cashbackRate: 7, maxWithdrawal: 10000000, badge: "🔴", minXp: 50000 },
  { level: 9, name: "Maître", dailyBonus: 3000, cashbackRate: 8, maxWithdrawal: 20000000, badge: "⚡", minXp: 100000 },
  { level: 10, name: "Légende", dailyBonus: 5000, cashbackRate: 10, maxWithdrawal: 999999999, badge: "🌟", minXp: 200000 },
];

router.get("/info", requireAuth, async (req, res) => {
  try {
    const userId = (req as any).userId;
    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId)).limit(1);
    if (!user) return res.status(404).json({ error: "Utilisateur introuvable" });

    const currentXp = Number(user.vipXp);
    const currentLevel = user.vipLevel;
    const nextLevel = VIP_LEVELS.find(l => l.level === currentLevel + 1);

    return res.json({
      currentLevel,
      currentXp,
      nextLevelXp: nextLevel?.minXp || currentXp,
      levels: VIP_LEVELS,
    });
  } catch (err) {
    req.log.error(err);
    return res.status(500).json({ error: "Erreur serveur" });
  }
});

export default router;
