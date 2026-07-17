import { NextFunction, Request, Response } from "express";
import * as airtableService from "../services/airtable.service";

export async function getPricing(
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const catalog = await airtableService.getPricingCatalog();
    res.json(catalog);
  } catch (err) {
    next(err);
  }
}
