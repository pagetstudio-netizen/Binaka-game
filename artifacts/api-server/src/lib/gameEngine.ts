import { db } from "@workspace/db";
import { gameConfigTable } from "@workspace/db";
import { eq } from "drizzle-orm";

export const SLOT_SYMBOLS = ["🍒", "🍋", "🍇", "💎", "7️⃣", "⭐", "🔔"];

export const WHEEL_SEGMENTS = [
  { prize: "x2", multiplier: 2, color: "#16a34a" },
  { prize: "x1", multiplier: 1, color: "#f59e0b" },
  { prize: "x5", multiplier: 5, color: "#7c3aed" },
  { prize: "x0", multiplier: 0, color: "#dc2626" },
  { prize: "x10", multiplier: 10, color: "#0891b2" },
  { prize: "x0", multiplier: 0, color: "#dc2626" },
  { prize: "x3", multiplier: 3, color: "#d97706" },
  { prize: "x0", multiplier: 0, color: "#dc2626" },
];

export const SLOT_MULTIPLIERS: Record<string, number> = {
  "🍒🍒🍒": 2,
  "🍋🍋🍋": 5,
  "🍇🍇🍇": 3,
  "💎💎💎": 50,
  "7️⃣7️⃣7️⃣": 10,
  "⭐⭐⭐": 20,
  "🔔🔔🔔": 8,
};

export async function getGameConfig(gameType: string) {
  const config = await db.select().from(gameConfigTable).where(eq(gameConfigTable.gameType, gameType)).limit(1);
  if (config.length === 0) {
    return { minBet: 100, maxBet: 50000, rtp: 95, winProbability: 0.35, isActive: true };
  }
  return {
    minBet: Number(config[0].minBet),
    maxBet: Number(config[0].maxBet),
    rtp: Number(config[0].rtp),
    winProbability: Number(config[0].winProbability),
    isActive: config[0].isActive,
  };
}

export function spinSlots(winProbability: number): { reels: string[]; won: boolean; multiplier: number } {
  const won = Math.random() < winProbability;
  if (won) {
    const keys = Object.keys(SLOT_MULTIPLIERS);
    const winningCombo = keys[Math.floor(Math.random() * keys.length)];
    const symbol = winningCombo.split(/(?<=\p{Emoji})/u)[0] || winningCombo.slice(0, 2);
    return {
      reels: [symbol, symbol, symbol],
      won: true,
      multiplier: SLOT_MULTIPLIERS[winningCombo],
    };
  }
  // Non-winning spin — avoid matching triples
  let reels: string[];
  do {
    reels = [
      SLOT_SYMBOLS[Math.floor(Math.random() * SLOT_SYMBOLS.length)],
      SLOT_SYMBOLS[Math.floor(Math.random() * SLOT_SYMBOLS.length)],
      SLOT_SYMBOLS[Math.floor(Math.random() * SLOT_SYMBOLS.length)],
    ];
  } while (reels[0] === reels[1] && reels[1] === reels[2]);
  return { reels, won: false, multiplier: 0 };
}

export function spinWheel(winProbability: number): { segmentIndex: number; segment: typeof WHEEL_SEGMENTS[0]; won: boolean; spinAngle: number } {
  const won = Math.random() < winProbability;
  let segmentIndex: number;

  if (won) {
    // Pick a winning segment (multiplier > 1)
    const winningSegments = WHEEL_SEGMENTS.map((s, i) => ({ ...s, i })).filter(s => s.multiplier > 1);
    const chosen = winningSegments[Math.floor(Math.random() * winningSegments.length)];
    segmentIndex = chosen.i;
  } else {
    // Pick a losing segment (multiplier 0)
    const losingSegments = WHEEL_SEGMENTS.map((s, i) => ({ ...s, i })).filter(s => s.multiplier === 0);
    segmentIndex = losingSegments[Math.floor(Math.random() * losingSegments.length)].i;
  }

  const segmentAngle = 360 / WHEEL_SEGMENTS.length;
  const baseAngle = segmentIndex * segmentAngle;
  const spinAngle = 1440 + (360 - baseAngle - segmentAngle / 2); // multiple full spins

  return {
    segmentIndex,
    segment: WHEEL_SEGMENTS[segmentIndex],
    won: WHEEL_SEGMENTS[segmentIndex].multiplier > 1,
    spinAngle,
  };
}

export function scratchCard(winProbability: number, cardType: string): { symbols: string[]; won: boolean; multiplier: number } {
  const SCRATCH_SYMBOLS = ["💎", "💰", "⭐", "🏆", "🎁", "🍒"];
  const CARD_MULTIPLIERS: Record<string, number> = { bronze: 2, silver: 5, gold: 10 };

  const won = Math.random() < winProbability;
  if (won) {
    const winSymbol = SCRATCH_SYMBOLS[Math.floor(Math.random() * SCRATCH_SYMBOLS.length)];
    const others = SCRATCH_SYMBOLS.filter(s => s !== winSymbol);
    return {
      symbols: [
        winSymbol,
        others[Math.floor(Math.random() * others.length)],
        winSymbol,
        others[Math.floor(Math.random() * others.length)],
        winSymbol,
        others[Math.floor(Math.random() * others.length)],
        others[Math.floor(Math.random() * others.length)],
        others[Math.floor(Math.random() * others.length)],
        others[Math.floor(Math.random() * others.length)],
      ],
      won: true,
      multiplier: CARD_MULTIPLIERS[cardType] || 2,
    };
  }
  const symbols = Array.from({ length: 9 }, () => {
    let s: string[];
    s = SCRATCH_SYMBOLS.slice();
    return s[Math.floor(Math.random() * s.length)];
  });
  // Ensure no triple match
  return { symbols, won: false, multiplier: 0 };
}
