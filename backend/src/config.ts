import dotenv from "dotenv";

dotenv.config();

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export const config = {
  port: Number(process.env.PORT) || 4000,
  frontendOrigin: process.env.FRONTEND_ORIGIN || "http://localhost:3000",
  airtable: {
    apiKey: requireEnv("AIRTABLE_API_KEY"),
    baseId: requireEnv("AIRTABLE_BASE_ID"),
  },
  emailjs: {
    serviceId: process.env.EMAILJS_SERVICE_ID || "",
    publicKey: process.env.EMAILJS_PUBLIC_KEY || "",
    privateKey: process.env.EMAILJS_PRIVATE_KEY || "",
    ownerTemplateId: process.env.EMAILJS_OWNER_TEMPLATE_ID || "",
    clientTemplateId: process.env.EMAILJS_CLIENT_TEMPLATE_ID || "",
  },
  /** Your inbox for new proposal notifications */
  ownerEmail: process.env.OWNER_EMAIL || "",
};
