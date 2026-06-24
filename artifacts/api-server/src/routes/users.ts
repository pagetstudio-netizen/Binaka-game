import { Router } from "express";
import { db } from "@workspace/db";
import { usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { requireAuth } from "../lib/auth.js";
import { sanitizeUser } from "./auth.js";

const router = Router();

router.get("/me", requireAuth, async (req, res) => {
  try {
    const userId = (req as any).userId;
    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId)).limit(1);
    if (!user) return res.status(404).json({ error: "Utilisateur introuvable" });
    return res.json(sanitizeUser(user));
  } catch (err) {
    req.log.error(err);
    return res.status(500).json({ error: "Erreur serveur" });
  }
});

router.patch("/me", requireAuth, async (req, res) => {
  try {
    const userId = (req as any).userId;
    const { fullName, email, country, avatarUrl } = req.body;

    const updates: any = {};
    if (fullName) updates.fullName = fullName;
    if (email) updates.email = email;
    if (country) updates.country = country;
    if (avatarUrl) updates.avatarUrl = avatarUrl;

    const [updated] = await db.update(usersTable).set(updates).where(eq(usersTable.id, userId)).returning();
    return res.json(sanitizeUser(updated));
  } catch (err) {
    req.log.error(err);
    return res.status(500).json({ error: "Erreur serveur" });
  }
});

export default router;
