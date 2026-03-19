import { Router, type IRouter } from "express";
import healthRouter from "./health";
import wardrobeRouter from "./wardrobe";
import aiRouter from "./ai";
import authRouter from "./auth";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(wardrobeRouter);
router.use(aiRouter);

export default router;
