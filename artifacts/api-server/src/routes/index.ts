import { Router, type IRouter } from "express";
import healthRouter from "./health.js";
import authRouter from "./auth.js";
import usersRouter from "./users.js";
import walletRouter from "./wallet.js";
import gamesRouter from "./games.js";
import winnersRouter from "./winners.js";
import referralRouter from "./referral.js";
import notificationsRouter from "./notifications.js";
import bonusRouter from "./bonus.js";
import vipRouter from "./vip.js";
import adminRouter from "./admin.js";
import paymentsRouter from "./payments.js";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/auth", authRouter);
router.use("/users", usersRouter);
router.use("/wallet", walletRouter);
router.use("/games", gamesRouter);
router.use("/winners", winnersRouter);
router.use("/referral", referralRouter);
router.use("/notifications", notificationsRouter);
router.use("/bonus", bonusRouter);
router.use("/vip", vipRouter);
router.use("/admin", adminRouter);
router.use("/payments", paymentsRouter);

export default router;
