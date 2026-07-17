import { NextFunction, Request, Response } from "express";
import { z } from "zod";
import * as airtableService from "../services/airtable.service";
import * as emailService from "../services/email.service";
import { AppError } from "../middleware/errorHandler";

const createQuoteSchema = z.object({
  serviceId: z.string().min(1, "serviceId is required"),
  packageId: z.string().optional(),
  addonIds: z.array(z.string().min(1)).default([]),
  customerName: z.string().min(1, "customerName is required").max(200),
  customerEmail: z.string().email("customerEmail must be a valid email"),
  customServiceNote: z.string().max(500).optional(),
  brief: z.record(z.string().max(4000)).optional(),
});

export async function createQuote(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const parsed = createQuoteSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new AppError(
        parsed.error.errors.map((e) => e.message).join("; "),
        400
      );
    }

    const quote = await airtableService.createQuote(parsed.data);
    res.status(201).json(quote);
  } catch (err) {
    next(err);
  }
}

export async function getQuote(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const quoteId = z.string().min(1).parse(req.params.quoteId);
    const quote = await airtableService.getQuoteById(quoteId);

    if (!quote) {
      throw new AppError("Quote not found", 404);
    }

    res.json(quote);
  } catch (err) {
    next(err);
  }
}

export async function submitQuote(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const quoteId = z.string().min(1).parse(req.params.quoteId);
    const quote = await airtableService.getQuoteById(quoteId);
    if (!quote) {
      throw new AppError("Quote not found", 404);
    }

    if (quote.submittedAt) {
      res.json({
        ok: true,
        alreadySubmitted: true,
        quote,
      });
      return;
    }

    await emailService.sendProposalEmails({ quote });

    const updated = await airtableService.markQuoteSubmitted(quoteId);
    res.json({ ok: true, quote: updated });
  } catch (err) {
    next(err);
  }
}
