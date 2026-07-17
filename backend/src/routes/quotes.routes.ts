import { Router } from "express";
import {
  createQuote,
  getQuote,
  submitQuote,
} from "../controllers/quotes.controller";

const router = Router();

router.post("/", createQuote);
router.get("/:quoteId", getQuote);
router.post("/:quoteId/submit", submitQuote);

export default router;
