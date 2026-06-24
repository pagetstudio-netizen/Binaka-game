import { Router } from "express";
import { db } from "@workspace/db";
import { notificationsTable } from "@workspace/db";
import { eq, and, desc, sql } from "drizzle-orm";
import { requireAuth } from "../lib/auth.js";

const router = Router();

router.get("/", requireAuth, async (req, res) => {
  try {
    const userId = (req as any).userId;
    const limit = Math.min(Number(req.query.limit) || 20, 50);

    const notifications = await db.select().from(notificationsTable)
      .where(eq(notificationsTable.userId, userId))
      .orderBy(desc(notificationsTable.createdAt))
      .limit(limit);

    const [countRow] = await db.select({ count: sql<number>`COUNT(*)` })
      .from(notificationsTable)
      .where(and(eq(notificationsTable.userId, userId), eq(notificationsTable.isRead, false)));

    return res.json({ notifications, unreadCount: Number(countRow.count) });
  } catch (err) {
    req.log.error(err);
    return res.status(500).json({ error: "Erreur serveur" });
  }
});

router.patch("/:id/read", requireAuth, async (req, res) => {
  try {
    const userId = (req as any).userId;
    const id = Number(req.params.id);

    const [updated] = await db.update(notificationsTable)
      .set({ isRead: true })
      .where(and(eq(notificationsTable.id, id), eq(notificationsTable.userId, userId)))
      .returning();

    if (!updated) return res.status(404).json({ error: "Notification introuvable" });
    return res.json(updated);
  } catch (err) {
    req.log.error(err);
    return res.status(500).json({ error: "Erreur serveur" });
  }
});

export default router;
