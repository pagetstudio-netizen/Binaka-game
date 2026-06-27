import { Router } from "express";
import crypto from "crypto";
import { db } from "@workspace/db";
import { usersTable, transactionsTable } from "@workspace/db";
import { eq, and, sql } from "drizzle-orm";
import { requireAuth } from "../lib/auth.js";
import { nanoid } from "../lib/nanoid.js";

const router = Router();

/* ─── helpers ─────────────────────────────────────────────── */
const WESTPAY_SLUG    = process.env.WESTPAY_MERCHANT_SLUG ?? "";
const WESTPAY_SECRET  = process.env.WESTPAY_WEBHOOK_SECRET ?? "";
const NP_API_KEY      = process.env.NOWPAYMENTS_API_KEY ?? "";
const NP_IPN_SECRET   = process.env.NOWPAYMENTS_IPN_SECRET ?? "";
const APP_BASE_URL    = process.env.REPLIT_DEV_DOMAIN
  ? `https://${process.env.REPLIT_DEV_DOMAIN}`
  : (process.env.APP_BASE_URL ?? "http://localhost:5000");

const NP_BASE = "https://api.nowpayments.io/v1";

function hmacSha256(secret: string, data: string) {
  return crypto.createHmac("sha256", secret).update(data).digest("hex");
}

/* ══════════════════════════════════════════════════════════════
   WESTPAY — MOBILE MONEY
══════════════════════════════════════════════════════════════ */

/* POST /api/payments/westpay/initiate
   Crée une transaction pending et renvoie l'URL WestPay hébergée */
router.post("/westpay/initiate", requireAuth, async (req, res) => {
  try {
    if (!WESTPAY_SLUG) {
      return res.status(503).json({ error: "WestPay non configuré — WESTPAY_MERCHANT_SLUG manquant" });
    }

    const userId = (req as any).userId;
    const { amount, country = "Togo" } = req.body;

    if (!amount || Number(amount) < 1000) {
      return res.status(400).json({ error: "Montant minimum : 1 000 FCFA" });
    }
    if (Number(amount) > 2_000_000) {
      return res.status(400).json({ error: "Montant maximum : 2 000 000 FCFA" });
    }

    /* Référence interne pour relier le paiement à cet utilisateur */
    const internalRef = `BNK-${nanoid(14)}`;

    /* On crée une transaction pending */
    await db.insert(transactionsTable).values({
      userId,
      type: "deposit",
      amount: String(amount),
      status: "pending",
      method: "mobile_money",
      reference: internalRef,
      note: JSON.stringify({ provider: "westpay", country }),
    });

    /* URL de retour : le frontend détecte wp_ref pour rafraîchir le solde */
    const redirectUrl = `${APP_BASE_URL}/wallet?wp_ref=${internalRef}&wp_amount=${amount}`;

    const payUrl = new URL("https://westpay.cloud/pay");
    payUrl.searchParams.set("merchant", WESTPAY_SLUG);
    payUrl.searchParams.set("amount", String(Math.round(Number(amount))));
    payUrl.searchParams.set("country", country);
    payUrl.searchParams.set("redirect", redirectUrl);

    return res.json({ url: payUrl.toString(), ref: internalRef });
  } catch (err) {
    req.log.error(err);
    return res.status(500).json({ error: "Erreur serveur" });
  }
});

/* POST /api/payments/westpay/confirm-redirect
   Appelé par le frontend après redirection WestPay (status=success).
   Crédite le solde de manière provisoire (le webhook est la confirmation définitive). */
router.post("/westpay/confirm-redirect", requireAuth, async (req, res) => {
  try {
    const userId  = (req as any).userId;
    const { ref, amount, westpayRef } = req.body;

    if (!ref) return res.status(400).json({ error: "ref manquant" });

    /* Cherche la transaction pending associée */
    const [tx] = await db.select().from(transactionsTable)
      .where(and(
        eq(transactionsTable.userId, userId),
        eq(transactionsTable.reference, ref),
        eq(transactionsTable.status, "pending"),
      ))
      .limit(1);

    if (!tx) {
      return res.status(404).json({ error: "Transaction introuvable ou déjà traitée" });
    }

    /* Marquer comme completed + créditer */
    await db.update(transactionsTable)
      .set({
        status: "completed",
        note: JSON.stringify({
          provider: "westpay",
          westpayRef: westpayRef ?? null,
          confirmedVia: "redirect",
        }),
      })
      .where(eq(transactionsTable.id, tx.id));

    await db.update(usersTable)
      .set({ balance: sql`${usersTable.balance} + ${Number(tx.amount)}` })
      .where(eq(usersTable.id, userId));

    return res.json({ ok: true, amount: Number(tx.amount) });
  } catch (err) {
    req.log.error(err);
    return res.status(500).json({ error: "Erreur serveur" });
  }
});

/* POST /api/payments/westpay/webhook  (public — pas de requireAuth)
   Vérification HMAC-SHA256 puis crédit définitif. */
router.post("/westpay/webhook", async (req, res) => {
  try {
    /* Vérification signature */
    const signature = req.headers["x-robotpay-signature"] as string;
    const event     = req.headers["x-robotpay-event"] as string;

    if (WESTPAY_SECRET && signature) {
      const rawBody  = JSON.stringify(req.body);
      const expected = hmacSha256(WESTPAY_SECRET, rawBody);
      if (!crypto.timingSafeEqual(Buffer.from(signature, "hex"), Buffer.from(expected, "hex"))) {
        return res.status(401).json({ error: "Signature invalide" });
      }
    }

    if (event !== "payment.confirmed") {
      return res.json({ ok: true, skipped: true });
    }

    const { txId, amount, payer, country } = req.body;

    /* Cherche une transaction pending pour ce montant et ce payeur */
    const [user] = await db.select().from(usersTable)
      .where(eq(usersTable.phone, payer?.replace(/^\+/, "")))
      .limit(1);

    if (user) {
      /* Vérifier qu'une tx pending de ce montant existe */
      const [tx] = await db.select().from(transactionsTable)
        .where(and(
          eq(transactionsTable.userId, user.id),
          eq(transactionsTable.status, "pending"),
          eq(transactionsTable.method, "mobile_money"),
        ))
        .limit(1);

      if (tx) {
        await db.update(transactionsTable)
          .set({
            status: "completed",
            note: JSON.stringify({ provider: "westpay", txId, country, payer, confirmedVia: "webhook" }),
          })
          .where(eq(transactionsTable.id, tx.id));

        await db.update(usersTable)
          .set({ balance: sql`${usersTable.balance} + ${Number(tx.amount)}` })
          .where(eq(usersTable.id, user.id));
      }
    }

    return res.json({ ok: true });
  } catch (err) {
    console.error("WestPay webhook error:", err);
    return res.status(500).json({ error: "Erreur serveur" });
  }
});

/* ══════════════════════════════════════════════════════════════
   NOWPAYMENTS — CRYPTO (sans redirection)
══════════════════════════════════════════════════════════════ */

/* GET /api/payments/nowpayments/currencies
   Renvoie la liste des cryptos disponibles */
router.get("/nowpayments/currencies", requireAuth, async (req, res) => {
  try {
    if (!NP_API_KEY) {
      /* Mode démo : liste statique */
      return res.json({
        currencies: [
          { id: "usdttrc20", label: "USDT (TRC-20)",  symbol: "USDT", logo: "₮" },
          { id: "btc",       label: "Bitcoin",          symbol: "BTC",  logo: "₿" },
          { id: "eth",       label: "Ethereum",         symbol: "ETH",  logo: "Ξ" },
          { id: "bnbbsc",    label: "BNB (BSC)",        symbol: "BNB",  logo: "◈" },
        ],
      });
    }
    const r = await fetch(`${NP_BASE}/currencies`, {
      headers: { "x-api-key": NP_API_KEY },
    });
    const data = await r.json() as any;
    return res.json(data);
  } catch (err) {
    req.log.error(err);
    return res.status(500).json({ error: "Erreur serveur" });
  }
});

/* POST /api/payments/nowpayments/create
   Crée un paiement crypto et renvoie l'adresse de dépôt */
router.post("/nowpayments/create", requireAuth, async (req, res) => {
  try {
    if (!NP_API_KEY) {
      return res.status(503).json({ error: "NOWPayments non configuré — NOWPAYMENTS_API_KEY manquant" });
    }

    const userId = (req as any).userId;
    const { amount, payCurrency = "usdttrc20" } = req.body;

    if (!amount || Number(amount) < 1000) {
      return res.status(400).json({ error: "Montant minimum : 1 000 FCFA" });
    }

    const internalRef = `BNK-NP-${nanoid(12)}`;

    /* Convertir FCFA → USD (1 USD ≈ 600 XOF) */
    const amountUsd = (Number(amount) / 600).toFixed(2);

    const npPayload = {
      price_amount:    amountUsd,
      price_currency:  "usd",
      pay_currency:    payCurrency,
      order_id:        internalRef,
      order_description: `Dépôt Binaka Game — ${Number(amount).toLocaleString("fr-FR")} FCFA`,
      ipn_callback_url: `${APP_BASE_URL}/api/payments/nowpayments/webhook`,
    };

    const npRes = await fetch(`${NP_BASE}/payment`, {
      method: "POST",
      headers: {
        "x-api-key": NP_API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(npPayload),
    });

    if (!npRes.ok) {
      const err = await npRes.json() as any;
      return res.status(502).json({ error: err.message ?? "Erreur NOWPayments" });
    }

    const npData = await npRes.json() as any;

    /* Enregistrer la transaction pending */
    await db.insert(transactionsTable).values({
      userId,
      type: "deposit",
      amount: String(amount),
      status: "pending",
      method: "crypto",
      reference: internalRef,
      note: JSON.stringify({
        provider: "nowpayments",
        paymentId: npData.payment_id,
        payCurrency,
        payAddress: npData.pay_address,
        payAmount: npData.pay_amount,
      }),
    });

    return res.json({
      paymentId:   npData.payment_id,
      payAddress:  npData.pay_address,
      payAmount:   npData.pay_amount,
      payCurrency: npData.pay_currency,
      expiresAt:   npData.valid_until ?? null,
      status:      npData.payment_status,
      internalRef,
    });
  } catch (err) {
    req.log.error(err);
    return res.status(500).json({ error: "Erreur serveur" });
  }
});

/* GET /api/payments/nowpayments/status/:paymentId
   Polling côté frontend pour vérifier si le paiement crypto est confirmé */
router.get("/nowpayments/status/:paymentId", requireAuth, async (req, res) => {
  try {
    if (!NP_API_KEY) return res.status(503).json({ error: "NOWPayments non configuré" });

    const { paymentId } = req.params;
    const npRes = await fetch(`${NP_BASE}/payment/${paymentId}`, {
      headers: { "x-api-key": NP_API_KEY },
    });

    if (!npRes.ok) {
      const err = await npRes.json() as any;
      return res.status(502).json({ error: err.message ?? "Erreur NOWPayments" });
    }

    const npData = await npRes.json() as any;
    return res.json({
      status:      npData.payment_status,
      payAmount:   npData.pay_amount,
      actuallyPaid: npData.actually_paid,
      payCurrency: npData.pay_currency,
    });
  } catch (err) {
    req.log.error(err);
    return res.status(500).json({ error: "Erreur serveur" });
  }
});

/* POST /api/payments/nowpayments/webhook  (IPN — public)
   Vérification HMAC + crédit balance */
router.post("/nowpayments/webhook", async (req, res) => {
  try {
    /* Vérification signature IPN */
    if (NP_IPN_SECRET) {
      const sig = req.headers["x-nowpayments-sig"] as string;
      const sorted = JSON.stringify(
        Object.keys(req.body).sort().reduce((acc: any, k) => { acc[k] = req.body[k]; return acc; }, {})
      );
      const expected = hmacSha256(NP_IPN_SECRET, sorted);
      if (sig !== expected) {
        return res.status(401).json({ error: "Signature IPN invalide" });
      }
    }

    const { payment_status, order_id, price_amount, actually_paid, pay_currency } = req.body;

    /* On ne traite que les paiements confirmés */
    if (!["finished", "confirmed", "partially_paid"].includes(payment_status)) {
      return res.json({ ok: true, skipped: true });
    }

    /* Cherche la transaction par référence interne */
    const [tx] = await db.select().from(transactionsTable)
      .where(and(
        eq(transactionsTable.reference, order_id),
        eq(transactionsTable.status, "pending"),
      ))
      .limit(1);

    if (!tx) return res.json({ ok: true, skipped: "already processed" });

    await db.update(transactionsTable)
      .set({
        status: "completed",
        note: JSON.stringify({
          provider: "nowpayments",
          paymentStatus: payment_status,
          actuallyPaid: actually_paid,
          payCurrency: pay_currency,
          confirmedVia: "webhook",
        }),
      })
      .where(eq(transactionsTable.id, tx.id));

    await db.update(usersTable)
      .set({ balance: sql`${usersTable.balance} + ${Number(tx.amount)}` })
      .where(eq(usersTable.id, tx.userId));

    return res.json({ ok: true });
  } catch (err) {
    console.error("NOWPayments webhook error:", err);
    return res.status(500).json({ error: "Erreur serveur" });
  }
});

export default router;
