import { Router } from "express";
import { getPricing } from "../controllers/pricing.controller";

const router = Router();

router.get("/", getPricing);

export default router;
