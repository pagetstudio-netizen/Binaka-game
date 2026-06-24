import { pgTable, text, serial, boolean, integer, numeric, timestamp, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const usersTable = pgTable("users", {
  id: serial("id").primaryKey(),
  fullName: text("full_name").notNull(),
  phone: text("phone").notNull().unique(),
  email: text("email"),
  passwordHash: text("password_hash").notNull(),
  country: text("country").notNull().default("Togo"),
  balance: numeric("balance", { precision: 14, scale: 2 }).notNull().default("0"),
  vipLevel: integer("vip_level").notNull().default(1),
  vipXp: numeric("vip_xp", { precision: 14, scale: 2 }).notNull().default("0"),
  isVerified: boolean("is_verified").notNull().default(false),
  isBlocked: boolean("is_blocked").notNull().default(false),
  isAdmin: boolean("is_admin").notNull().default(false),
  referralCode: text("referral_code").notNull().unique(),
  referredBy: integer("referred_by"),
  avatarUrl: text("avatar_url"),
  lastDailyBonus: timestamp("last_daily_bonus"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (t) => [
  index("users_phone_idx").on(t.phone),
  index("users_referral_code_idx").on(t.referralCode),
]);

export const insertUserSchema = createInsertSchema(usersTable).omit({ id: true, createdAt: true });
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof usersTable.$inferSelect;
