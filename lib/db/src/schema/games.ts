import { pgTable, serial, integer, text, numeric, boolean, timestamp, jsonb, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const gameHistoryTable = pgTable("game_history", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  gameType: text("game_type").notNull(), // slots | wheel | scratch
  betAmount: numeric("bet_amount", { precision: 14, scale: 2 }).notNull(),
  winAmount: numeric("win_amount", { precision: 14, scale: 2 }).notNull().default("0"),
  won: boolean("won").notNull().default(false),
  multiplier: numeric("multiplier", { precision: 10, scale: 2 }),
  details: jsonb("details"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (t) => [
  index("game_history_user_idx").on(t.userId),
  index("game_history_type_idx").on(t.gameType),
  index("game_history_created_idx").on(t.createdAt),
]);

export const gameConfigTable = pgTable("game_config", {
  id: serial("id").primaryKey(),
  gameType: text("game_type").notNull().unique(),
  minBet: numeric("min_bet", { precision: 14, scale: 2 }).notNull().default("100"),
  maxBet: numeric("max_bet", { precision: 14, scale: 2 }).notNull().default("50000"),
  rtp: numeric("rtp", { precision: 5, scale: 2 }).notNull().default("95"),
  winProbability: numeric("win_probability", { precision: 5, scale: 4 }).notNull().default("0.35"),
  isActive: boolean("is_active").notNull().default(true),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertGameHistorySchema = createInsertSchema(gameHistoryTable).omit({ id: true, createdAt: true });
export type InsertGameHistory = z.infer<typeof insertGameHistorySchema>;
export type GameHistory = typeof gameHistoryTable.$inferSelect;
export type GameConfig = typeof gameConfigTable.$inferSelect;
