import { Router } from "express";
import bcrypt from "bcrypt";
import { db } from "@workspace/db";
import { usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { signToken, requireAuth } from "../lib/auth.js";
import { nanoid } from "../lib/nanoid.js";

const router = Router();

router.post("/register", async (req, res) => {
  try {
    const { fullName, phone, password, country, email, referralCode } = req.body;

    if (!fullName || !phone || !password || !country) {
      return res.status(400).json({ error: "Tous les champs requis" });
    }

    const existing = await db.select().from(usersTable).where(eq(usersTable.phone, phone)).limit(1);
    if (existing.length > 0) {
      return res.status(400).json({ error: "Ce numéro est déjà enregistré" });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const newReferralCode = nanoid(8).toUpperCase();

    let referredById: number | null = null;
    if (referralCode) {
      const referrer = await db.select().from(usersTable).where(eq(usersTable.referralCode, referralCode)).limit(1);
      if (referrer.length > 0) referredById = referrer[0].id;
    }

    const [user] = await db.insert(usersTable).values({
      fullName,
      phone,
      email: email || null,
      passwordHash,
      country,
      referralCode: newReferralCode,
      referredBy: referredById,
      balance: "1000", // Bonus d'inscription
    }).returning();

    // Create welcome notification
    await db.execute(`INSERT INTO notifications (user_id, title, message, type) VALUES (${user.id}, 'Bienvenue sur BINAKA GAME !', 'Votre compte a été créé avec succès. Profitez de votre bonus de bienvenue de 1 000 FCFA !', 'promo')`);

    const token = signToken({ userId: user.id, isAdmin: user.isAdmin });
    return res.status(201).json({ token, user: sanitizeUser(user) });
  } catch (err) {
    req.log.error(err);
    return res.status(500).json({ error: "Erreur serveur" });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { phone, password } = req.body;
    if (!phone || !password) {
      return res.status(400).json({ error: "Téléphone et mot de passe requis" });
    }

    const [user] = await db.select().from(usersTable).where(eq(usersTable.phone, phone)).limit(1);
    if (!user) {
      return res.status(401).json({ error: "Identifiants incorrects" });
    }
    if (user.isBlocked) {
      return res.status(403).json({ error: "Compte bloqué. Contactez le support." });
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      return res.status(401).json({ error: "Identifiants incorrects" });
    }

    const token = signToken({ userId: user.id, isAdmin: user.isAdmin });
    return res.json({ token, user: sanitizeUser(user) });
  } catch (err) {
    req.log.error(err);
    return res.status(500).json({ error: "Erreur serveur" });
  }
});

export function sanitizeUser(user: any) {
  const { passwordHash, ...rest } = user;
  return {
    ...rest,
    balance: Number(rest.balance),
    vipXp: Number(rest.vipXp),
  };
}

export default router;
