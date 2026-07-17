import emailjs, { EmailJSResponseStatus } from "@emailjs/nodejs";
import { config } from "../config";
import type { Quote } from "../types";

function formatMoney(n: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(n);
}

function projectTitle(quote: Quote) {
  return quote.brief?.projectName?.trim() || `Proposal for ${quote.customerName}`;
}

function proposalUrl(quoteId: string) {
  return `${config.frontendOrigin.replace(/\/$/, "")}/proposal/${quoteId}`;
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** Known brief field labels — keep in sync with frontend briefFields. */
const BRIEF_FIELD_LABELS: Record<string, string> = {
  projectName: "Project name",
  goals: "Brief summary of project",
  timeline: "Ideal timeline",
  budgetRange: "Budget range (optional)",
  mustHaves: "Must-haves",
  niceToHaves: "Nice-to-haves",
  constraints: "Constraints or existing assets",
  references: "References / competitors / inspiration",
  extraNotes: "Anything else we should know?",
  deliverableFocus: "Primary deliverable focus",
  platform: "Platform / stack preferences",
  audience: "Primary audience",
  complianceNeeds: "Compliance or security needs",
  customScope: "Describe the custom work in detail",
};

function briefFieldLabel(key: string) {
  return (
    BRIEF_FIELD_LABELS[key] ||
    key.replace(/([A-Z])/g, " $1").replace(/^./, (c) => c.toUpperCase()).trim()
  );
}

/** Escape HTML and turn **bold** + newlines into email-safe markup. */
function formatBriefValueHtml(value: string) {
  return escapeHtml(value)
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/\n/g, "<br/>");
}

function briefRowsHtml(quote: Quote): string {
  const brief = quote.brief;
  if (!brief) return "";
  const entries = Object.entries(brief).filter(([, v]) => v?.trim());
  if (!entries.length) return "";

  const rows = entries
    .map(
      ([key, value]) => `
      <tr>
        <td style="padding:10px 0;border-bottom:1px solid #e8ece9;vertical-align:top;width:34%;color:#181c1a;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:0.04em;">
          ${escapeHtml(briefFieldLabel(key))}
        </td>
        <td style="padding:10px 0;border-bottom:1px solid #e8ece9;color:#3f4944;font-size:13px;line-height:1.55;">
          ${formatBriefValueHtml(value)}
        </td>
      </tr>`
    )
    .join("");

  return `
    <p style="margin:20px 0 8px;color:#004532;font-size:13px;font-weight:700;letter-spacing:0.04em;text-transform:uppercase;">Brief</p>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0">${rows}</table>`;
}

function addonsHtml(quote: Quote): string {
  if (!quote.addons.length) {
    return `<p style="margin:0 0 8px;color:#3f4944;font-size:14px;"><strong>Add-ons:</strong> None</p>`;
  }
  const items = quote.addons
    .map(
      (a) =>
        `<li style="margin:0 0 4px;">${escapeHtml(a.name)} — ${formatMoney(a.price)}</li>`
    )
    .join("");
  return `
    <p style="margin:0 0 6px;color:#3f4944;font-size:14px;"><strong>Add-ons:</strong></p>
    <ul style="margin:0 0 12px;padding-left:18px;color:#3f4944;font-size:14px;">${items}</ul>
    <p style="margin:0 0 8px;color:#3f4944;font-size:14px;"><strong>Add-on total:</strong> ${formatMoney(quote.addonTotal)}</p>`;
}

/** Owner email: full proposal data inlined in the body (no PDF attachment). */
function ownerEmailHtml(quote: Quote): string {
  const title = projectTitle(quote);
  const estimate = quote.briefEstimate
    ? `<p style="margin:0 0 8px;color:#3f4944;font-size:14px;"><strong>Suggested range:</strong> ${formatMoney(quote.briefEstimate.low)} – ${formatMoney(quote.briefEstimate.high)}</p>`
    : "";

  return `<!DOCTYPE html>
<html>
<body style="margin:0;padding:0;background:#f7faf6;font-family:Segoe UI,Helvetica,Arial,sans-serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f7faf6;padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width:560px;background:#ffffff;border-radius:16px;border:1px solid rgba(17,24,39,0.06);">
          <tr>
            <td style="padding:28px;">
              <p style="margin:0;color:#004532;font-size:18px;font-weight:700;letter-spacing:-0.02em;">Quotely</p>
              <p style="margin:16px 0 0;color:#004532;font-size:13px;font-weight:600;letter-spacing:0.04em;text-transform:uppercase;">New proposal</p>
              <h1 style="margin:20px 0 8px;font-size:22px;color:#181c1a;">${escapeHtml(title)}</h1>
              <p style="margin:0 0 16px;color:#3f4944;font-size:14px;">
                From <strong>${escapeHtml(quote.customerName)}</strong> &lt;${escapeHtml(quote.customerEmail)}&gt;
              </p>

              <table role="presentation" width="100%" style="background:#f1f4f0;border-radius:12px;margin:0 0 16px;">
                <tr>
                  <td style="padding:16px 18px;">
                    <p style="margin:0 0 4px;color:#6f7973;font-size:12px;">Estimated total</p>
                    <p style="margin:0;color:#004532;font-size:28px;font-weight:700;">${formatMoney(quote.totalPrice)}</p>
                  </td>
                </tr>
              </table>

              <p style="margin:0 0 8px;color:#3f4944;font-size:14px;"><strong>Service:</strong> ${escapeHtml(quote.serviceName)}</p>
              <p style="margin:0 0 8px;color:#3f4944;font-size:14px;"><strong>Package:</strong> ${escapeHtml(quote.packageName)} (${formatMoney(quote.packagePrice)})</p>
              ${estimate}
              ${addonsHtml(quote)}
              ${briefRowsHtml(quote)}

              <p style="margin:20px 0 0;">
                <a href="${proposalUrl(quote.quoteId)}" style="display:inline-block;background:#004532;color:#ffffff;text-decoration:none;padding:12px 18px;border-radius:8px;font-size:14px;font-weight:600;">Open in Quotely</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

/** Client email: short confirmation only. */
function clientEmailHtml(quote: Quote): string {
  const title = projectTitle(quote);
  const total = formatMoney(quote.totalPrice);
  const range = quote.briefEstimate
    ? `<p style="margin:0 0 16px;color:#3f4944;font-size:14px;">Suggested range: <strong>${formatMoney(quote.briefEstimate.low)} – ${formatMoney(quote.briefEstimate.high)}</strong></p>`
    : "";

  return `<!DOCTYPE html>
<html>
<body style="margin:0;padding:0;background:#f7faf6;font-family:Segoe UI,Helvetica,Arial,sans-serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f7faf6;padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width:560px;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid rgba(17,24,39,0.06);">
          <tr>
            <td style="padding:28px 28px 12px;">
              <p style="margin:0;color:#004532;font-size:18px;font-weight:700;letter-spacing:-0.02em;">Quotely</p>
            </td>
          </tr>
          <tr>
            <td style="padding:8px 28px 28px;">
              <p style="margin:0 0 8px;color:#6f7973;font-size:12px;text-transform:uppercase;letter-spacing:0.08em;">Proposal received</p>
              <h1 style="margin:0 0 12px;color:#181c1a;font-size:24px;line-height:1.25;letter-spacing:-0.02em;">Thanks, ${escapeHtml(quote.customerName)}</h1>
              <p style="margin:0 0 16px;color:#3f4944;font-size:15px;line-height:1.6;">
                We’ve received your proposal for <strong>${escapeHtml(title)}</strong> and our team will review it shortly. You’ll hear from us soon.
              </p>
              <table role="presentation" width="100%" style="background:#f1f4f0;border-radius:12px;margin:0 0 20px;">
                <tr>
                  <td style="padding:16px 18px;">
                    <p style="margin:0 0 4px;color:#6f7973;font-size:12px;">Estimated total</p>
                    <p style="margin:0;color:#004532;font-size:28px;font-weight:700;">${total}</p>
                    ${range}
                    <p style="margin:8px 0 0;color:#3f4944;font-size:13px;">${escapeHtml(quote.serviceName)} · ${escapeHtml(quote.packageName)}</p>
                  </td>
                </tr>
              </table>
              <a href="${proposalUrl(quote.quoteId)}" style="display:inline-block;background:#004532;color:#ffffff;text-decoration:none;padding:12px 18px;border-radius:8px;font-size:14px;font-weight:600;">View proposal</a>
            </td>
          </tr>
        </table>
        <p style="margin:16px 0 0;color:#6f7973;font-size:11px;">Sent by Quotely</p>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function assertEmailConfigured() {
  const { serviceId, publicKey, ownerTemplateId, clientTemplateId } =
    config.emailjs;
  if (!serviceId || !publicKey || !ownerTemplateId || !clientTemplateId) {
    throw Object.assign(
      new Error(
        "Email is not configured. Set EMAILJS_SERVICE_ID, EMAILJS_PUBLIC_KEY, EMAILJS_OWNER_TEMPLATE_ID, EMAILJS_CLIENT_TEMPLATE_ID, and OWNER_EMAIL in the backend .env"
      ),
      { statusCode: 503 }
    );
  }
  if (!config.ownerEmail) {
    throw Object.assign(
      new Error("OWNER_EMAIL is required to receive submitted proposals"),
      { statusCode: 503 }
    );
  }
}

async function sendTemplate(
  templateId: string,
  templateParams: Record<string, string>
) {
  try {
    return await emailjs.send(
      config.emailjs.serviceId,
      templateId,
      templateParams,
      {
        publicKey: config.emailjs.publicKey,
        privateKey: config.emailjs.privateKey || undefined,
      }
    );
  } catch (err) {
    if (err instanceof EmailJSResponseStatus) {
      throw Object.assign(
        new Error(err.text || `EmailJS failed (${err.status})`),
        { statusCode: 502 }
      );
    }
    throw err;
  }
}

export async function sendProposalEmails(input: {
  quote: Quote;
}): Promise<{ ownerStatus?: number; clientStatus?: number }> {
  assertEmailConfigured();

  const title = projectTitle(input.quote);

  const owner = await sendTemplate(config.emailjs.ownerTemplateId, {
    to_email: config.ownerEmail,
    reply_to: input.quote.customerEmail,
    subject: `New Quotely proposal: ${title}`,
    message_html: ownerEmailHtml(input.quote),
    customer_name: input.quote.customerName,
    customer_email: input.quote.customerEmail,
    project_title: title,
    service_name: input.quote.serviceName,
    package_name: input.quote.packageName,
    total_price: formatMoney(input.quote.totalPrice),
    proposal_url: proposalUrl(input.quote.quoteId),
  });

  const client = await sendTemplate(config.emailjs.clientTemplateId, {
    to_email: input.quote.customerEmail,
    subject: `We received your Quotely proposal — ${title}`,
    message_html: clientEmailHtml(input.quote),
    customer_name: input.quote.customerName,
    customer_email: input.quote.customerEmail,
    project_title: title,
    service_name: input.quote.serviceName,
    package_name: input.quote.packageName,
    total_price: formatMoney(input.quote.totalPrice),
    proposal_url: proposalUrl(input.quote.quoteId),
  });

  return {
    ownerStatus: owner.status,
    clientStatus: client.status,
  };
}
