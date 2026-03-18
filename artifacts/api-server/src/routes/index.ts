import { Router, type IRouter } from "express";
import healthRouter from "./health";
import wardrobeRouter from "./wardrobe";
import aiRouter from "./ai";

const router: IRouter = Router();

router.use(healthRouter);
router.use(wardrobeRouter);
router.use(aiRouter);

export default router;
