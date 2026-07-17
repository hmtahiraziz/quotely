import cors from "cors";
import dns from "dns";
import express from "express";
import { config } from "./config";
import { errorHandler } from "./middleware/errorHandler";
import pricingRoutes from "./routes/pricing.routes";
import quotesRoutes from "./routes/quotes.routes";

try {
  dns.setDefaultResultOrder("ipv4first");
} catch {
  // no-op on unsupported Node versions
}

const app = express();

app.use(
  cors({
    origin: config.frontendOrigin,
  })
);
app.use(express.json({ limit: "12mb" }));

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/pricing", pricingRoutes);
app.use("/api/quotes", quotesRoutes);

app.use(errorHandler);

app.listen(config.port, () => {
  console.log(`Quotely API listening on http://localhost:${config.port}`);
});
