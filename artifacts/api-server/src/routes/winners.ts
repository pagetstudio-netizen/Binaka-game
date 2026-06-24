import { Router } from "express";
import { db } from "@workspace/db";
import { gameHistoryTable, usersTable } from "@workspace/db";
import { desc, eq, gt, sql } from "drizzle-orm";

const router = Router();

router.get("/recent", async (req, res) => {
  try {
    const limit = Math.min(Number(req.query.limit) || 10, 50);

    const winners = await db
      .select({
        id: gameHistoryTable.id,
        username: usersTable.fullName,
        avatarUrl: usersTable.avatarUrl,
        gameType: gameHistoryTable.gameType,
        winAmount: gameHistoryTable.winAmount,
        multiplier: gameHistoryTable.multiplier,
        createdAt: gameHistoryTable.createdAt,
      })
      .from(gameHistoryTable)
      .innerJoin(usersTable, eq(gameHistoryTable.userId, usersTable.id))
      .where(gt(gameHistoryTable.winAmount, sql`0`))
      .orderBy(desc(gameHistoryTable.createdAt))
      .limit(limit);

    return res.json(winners.map(w => ({
      ...w,
      winAmount: Number(w.winAmount),
      multiplier: w.multiplier ? Number(w.multiplier) : null,
      username: maskName(w.username),
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
