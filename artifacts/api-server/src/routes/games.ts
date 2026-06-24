import { Router } from "express";
import { db } from "@workspace/db";
import { usersTable, transactionsTable, gameHistoryTable } from "@workspace/db";
import { eq, desc, sql } from "drizzle-orm";
import { requireAuth } from "../lib/auth.js";
import { getGameConfig, spinSlots, spinWheel, scratchCard } from "../lib/gameEngine.js";

const router = Router();

// Slot Machine
router.post("/slots/play", requireAuth, async (req, res) => {
  try {
    const userId = (req as any).userId;
    const { betAmount } = req.body;

    const config = await getGameConfig("slots");
    if (!config.isActive) return res.status(400).json({ error: "Jeu indisponible" });
    if (!betAmount || betAmount < config.minBet || betAmount > config.maxBet) {
      return res.status(400).json({ error: `Mise entre ${config.minBet} et ${config.maxBet} FCFA` });
    }

    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId)).limit(1);
    if (!user || Number(user.balance) < betAmount) {
      return res.status(400).json({ error: "Solde insuffisant" });
    }

    const result = spinSlots(config.winProbability);
    const winAmount = result.won ? betAmount * result.multiplier : 0;
    const netChange = winAmount - betAmount;

    await db.update(usersTable).set({
      balance: sql`${usersTable.balance} + ${netChange}`,
      vipXp: sql`${usersTable.vipXp} + ${betAmount * 0.01}`,
    }).where(eq(usersTable.id, userId));

    const [game] = await db.insert(gameHistoryTable).values({
      userId,
      gameType: "slots",
      betAmount: betAmount.toString(),
      winAmount: winAmount.toString(),
      won: result.won,
      multiplier: result.multiplier.toString(),
      details: JSON.stringify(result.reels),
    }).returning();

    if (result.won) {
      await db.insert(transactionsTable).values({
        userId,
        type: "game_win",
        amount: winAmount.toString(),
        status: "completed",
        method: "platform",
        note: `Slot Machine x${result.multiplier}`,
      });
    } else {
      await db.insert(transactionsTable).values({
        userId,
        type: "game_loss",
        amount: betAmount.toString(),
        status: "completed",
        method: "platform",
        note: "Slot Machine",
      });
    }

    const [updated] = await db.select().from(usersTable).where(eq(usersTable.id, userId)).limit(1);
    return res.json({ reels: result.reels, won: result.won, winAmount, multiplier: result.multiplier, newBalance: Number(updated.balance), gameId: game.id });
  } catch (err) {
    req.log.error(err);
    return res.status(500).json({ error: "Erreur serveur" });
  }
});

router.get("/slots/history", requireAuth, async (req, res) => {
  try {
    const userId = (req as any).userId;
    const limit = Math.min(Number(req.query.limit) || 20, 50);
    const games = await db.select().from(gameHistoryTable)
      .where(eq(gameHistoryTable.userId, userId))
      .orderBy(desc(gameHistoryTable.createdAt)).limit(limit);
    const [countRow] = await db.select({ count: sql<number>`COUNT(*)` }).from(gameHistoryTable).where(eq(gameHistoryTable.userId, userId));
    return res.json({ games, total: Number(countRow.count) });
  } catch (err) {
    req.log.error(err);
    return res.status(500).json({ error: "Erreur serveur" });
  }
});

// Wheel of Fortune
router.post("/wheel/play", requireAuth, async (req, res) => {
  try {
    const userId = (req as any).userId;
    const { betAmount } = req.body;

    const config = await getGameConfig("wheel");
    if (!config.isActive) return res.status(400).json({ error: "Jeu indisponible" });
    if (!betAmount || betAmount < config.minBet || betAmount > config.maxBet) {
      return res.status(400).json({ error: `Mise entre ${config.minBet} et ${config.maxBet} FCFA` });
    }

    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId)).limit(1);
    if (!user || Number(user.balance) < betAmount) {
      return res.status(400).json({ error: "Solde insuffisant" });
    }

    const result = spinWheel(config.winProbability);
    const winAmount = result.won ? betAmount * result.segment.multiplier : 0;
    const netChange = winAmount - betAmount;

    await db.update(usersTable).set({
      balance: sql`${usersTable.balance} + ${netChange}`,
      vipXp: sql`${usersTable.vipXp} + ${betAmount * 0.01}`,
    }).where(eq(usersTable.id, userId));

    const [game] = await db.insert(gameHistoryTable).values({
      userId,
      gameType: "wheel",
      betAmount: betAmount.toString(),
      winAmount: winAmount.toString(),
      won: result.won,
      multiplier: result.segment.multiplier.toString(),
      details: JSON.stringify({ segment: result.segmentIndex, prize: result.segment.prize }),
    }).returning();

    if (result.won) {
      await db.insert(transactionsTable).values({
        userId, type: "game_win", amount: winAmount.toString(), status: "completed",
        method: "platform", note: `Roue de la Fortune ${result.segment.prize}`,
      });
    } else {
      await db.insert(transactionsTable).values({
        userId, type: "game_loss", amount: betAmount.toString(), status: "completed",
        method: "platform", note: "Roue de la Fortune",
      });
    }

    const [updated] = await db.select().from(usersTable).where(eq(usersTable.id, userId)).limit(1);
    return res.json({
      segment: result.segmentIndex, prize: result.segment.prize,
      won: result.won, winAmount, newBalance: Number(updated.balance),
      spinAngle: result.spinAngle, gameId: game.id,
    });
  } catch (err) {
    req.log.error(err);
    return res.status(500).json({ error: "Erreur serveur" });
  }
});

router.get("/wheel/history", requireAuth, async (req, res) => {
  try {
    const userId = (req as any).userId;
    const limit = Math.min(Number(req.query.limit) || 20, 50);
    const games = await db.select().from(gameHistoryTable)
      .where(eq(gameHistoryTable.userId, userId))
      .orderBy(desc(gameHistoryTable.createdAt)).limit(limit);
    const [countRow] = await db.select({ count: sql<number>`COUNT(*)` }).from(gameHistoryTable).where(eq(gameHistoryTable.userId, userId));
    return res.json({ games, total: Number(countRow.count) });
  } catch (err) {
    req.log.error(err);
    return res.status(500).json({ error: "Erreur serveur" });
  }
});

// Scratch Card
router.post("/scratch/play", requireAuth, async (req, res) => {
  try {
    const userId = (req as any).userId;
    const { betAmount, cardType } = req.body;

    const config = await getGameConfig("scratch");
    if (!config.isActive) return res.status(400).json({ error: "Jeu indisponible" });

    const CARD_PRICES: Record<string, number> = { bronze: 500, silver: 1000, gold: 2000 };
    const minBet = CARD_PRICES[cardType] || config.minBet;

    if (!betAmount || betAmount < minBet) {
      return res.status(400).json({ error: `Mise minimale: ${minBet} FCFA pour ${cardType}` });
    }

    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId)).limit(1);
    if (!user || Number(user.balance) < betAmount) {
      return res.status(400).json({ error: "Solde insuffisant" });
    }

    const result = scratchCard(config.winProbability, cardType);
    const winAmount = result.won ? betAmount * result.multiplier : 0;
    const netChange = winAmount - betAmount;

    await db.update(usersTable).set({
      balance: sql`${usersTable.balance} + ${netChange}`,
      vipXp: sql`${usersTable.vipXp} + ${betAmount * 0.01}`,
    }).where(eq(usersTable.id, userId));

    const [game] = await db.insert(gameHistoryTable).values({
      userId,
      gameType: "scratch",
      betAmount: betAmount.toString(),
      winAmount: winAmount.toString(),
      won: result.won,
      multiplier: result.multiplier.toString(),
      details: JSON.stringify({ symbols: result.symbols, cardType }),
    }).returning();

    if (result.won) {
      await db.insert(transactionsTable).values({
        userId, type: "game_win", amount: winAmount.toString(), status: "completed",
        method: "platform", note: `Carte à Gratter ${cardType} x${result.multiplier}`,
      });
    } else {
      await db.insert(transactionsTable).values({
        userId, type: "game_loss", amount: betAmount.toString(), status: "completed",
        method: "platform", note: `Carte à Gratter ${cardType}`,
      });
    }

    const [updated] = await db.select().from(usersTable).where(eq(usersTable.id, userId)).limit(1);
    return res.json({
      symbols: result.symbols, won: result.won, winAmount,
      newBalance: Number(updated.balance), cardType, gameId: game.id,
    });
  } catch (err) {
    req.log.error(err);
    return res.status(500).json({ error: "Erreur serveur" });
  }
});

router.get("/scratch/history", requireAuth, async (req, res) => {
  try {
    const userId = (req as any).userId;
    const limit = Math.min(Number(req.query.limit) || 20, 50);
    const games = await db.select().from(gameHistoryTable)
      .where(eq(gameHistoryTable.userId, userId))
      .orderBy(desc(gameHistoryTable.createdAt)).limit(limit);
    const [countRow] = await db.select({ count: sql<number>`COUNT(*)` }).from(gameHistoryTable).where(eq(gameHistoryTable.userId, userId));
    return res.json({ games, total: Number(countRow.count) });
  } catch (err) {
    req.log.error(err);
    return res.status(500).json({ error: "Erreur serveur" });
  }
});

export default router;
