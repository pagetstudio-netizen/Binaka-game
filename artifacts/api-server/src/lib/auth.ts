import jwt from "jsonwebtoken";
import type { Request, Response, NextFunction } from "express";

const JWT_SECRET = process.env.JWT_SECRET || process.env.SESSION_SECRET || "binaka_game_secret_2024";
const JWT_EXPIRES_IN = "30d";

export function signToken(payload: { userId: number; isAdmin: boolean }): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

export function verifyToken(token: string): { userId: number; isAdmin: boolean } | null {
  try {
    return jwt.verify(token, JWT_SECRET) as { userId: number; isAdmin: boolean };
  } catch {
    return null;
  }
}

export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({ error: "Non autorisé" });
    return;
  }
  const token = authHeader.slice(7);
  const payload = verifyToken(token);
  if (!payload) {
    res.status(401).json({ error: "Token invalide ou expiré" });
    return;
  }
  (req as any).userId = payload.userId;
  (req as any).isAdmin = payload.isAdmin;
  next();
}

export function requireAdmin(req: Request, res: Response, next: NextFunction): void {
  requireAuth(req, res, () => {
    if (!(req as any).isAdmin) {
      res.status(403).json({ error: "Accès refusé" });
      return;
    }
    next();
  });
}
