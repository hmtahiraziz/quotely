"use client";

import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
  pdf,
} from "@react-pdf/renderer";
import type { Quote } from "@/types/quote";
import {
  briefEntriesForDisplay,
  getBriefFieldsForService,
} from "@/lib/briefFields";
import { Button } from "@/components/ui/Button";

const styles = StyleSheet.create({
  page: {
    padding: 48,
    fontFamily: "Helvetica",
    color: "#181c1a",
    backgroundColor: "#ffffff",
  },
  logoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
  },
  logoMark: {
    width: 32,
    height: 32,
    marginRight: 10,
  },
  logoText: {
    color: "#004532",
    fontSize: 18,
    fontFamily: "Helvetica-Bold",
  },
  title: {
    fontSize: 22,
    fontFamily: "Helvetica-Bold",
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 11,
    color: "#3f4944",
    marginBottom: 6,
  },
  meta: {
    fontSize: 10,
    color: "#6f7973",
    marginTop: 2,
  },
  sectionLabel: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    color: "#3f4944",
    textTransform: "uppercase",
    letterSpacing: 1.2,
    marginBottom: 10,
    marginTop: 22,
  },
  briefBlock: {
    marginBottom: 14,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e3df",
  },
  briefLabel: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    color: "#181c1a",
    marginBottom: 6,
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
  briefValue: {
    fontSize: 11,
    color: "#3f4944",
    lineHeight: 1.5,
  },
  briefValueBold: {
    fontFamily: "Helvetica-Bold",
    color: "#181c1a",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e3df",
  },
  rowLabel: {
    fontSize: 12,
    color: "#181c1a",
    width: "70%",
    paddingRight: 12,
  },
  rowValue: {
    fontSize: 12,
    fontFamily: "Helvetica-Bold",
    color: "#181c1a",
    width: "30%",
    textAlign: "right",
  },
  rationale: {
    fontSize: 10,
    color: "#6f7973",
    marginBottom: 3,
    marginLeft: 4,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 16,
    paddingTop: 12,
    borderTopWidth: 2,
    borderTopColor: "#004532",
  },
  totalLabel: {
    fontSize: 14,
    fontFamily: "Helvetica-Bold",
  },
  totalValue: {
    fontSize: 16,
    fontFamily: "Helvetica-Bold",
    color: "#004532",
  },
});

function formatMoney(n: number) {
  return `$${n.toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
}

function logoSrc() {
  if (typeof window === "undefined") return "/brand/quotely-mark.png";
  return `${window.location.origin}/brand/quotely-mark.png`;
}

/** Renders plain text with optional **bold** markers. */
function BriefValueText({ value }: { value: string }) {
  const parts = value.split(/(\*\*[^*]+\*\*)/g).filter(Boolean);
  return (
    <Text style={styles.briefValue}>
      {parts.map((part, index) => {
        const bold = part.match(/^\*\*([^*]+)\*\*$/);
        if (bold) {
          return (
            <Text key={index} style={styles.briefValueBold}>
              {bold[1]}
            </Text>
          );
        }
        return <Text key={index}>{part}</Text>;
      })}
    </Text>
  );
}

export function ProposalDocument({ quote }: { quote: Quote }) {
  const brief = quote.brief || {};
  const briefRows = briefEntriesForDisplay(
    getBriefFieldsForService(quote.serviceName),
    brief
  );
  const projectTitle =
    brief.projectName?.trim() || `Proposal for ${quote.customerName}`;

  return (
    <Document>
      <Page size="A4" style={styles.page} wrap>
        <View style={styles.logoRow}>
          <Image src={logoSrc()} style={styles.logoMark} />
          <Text style={styles.logoText}>Quotely</Text>
        </View>

        <Text style={styles.title}>{projectTitle}</Text>
        <Text style={styles.subtitle}>
          Prepared for {quote.customerName} · {quote.customerEmail}
        </Text>
        <Text style={styles.meta}>
          Date: {new Date(quote.createdAt).toLocaleDateString()} · Valid 30 days
        </Text>

        {briefRows.length > 0 ? (
          <View>
            <Text style={styles.sectionLabel}>Project brief</Text>
            {briefRows.map((row) => (
              <View key={row.label} style={styles.briefBlock} wrap>
                <Text style={styles.briefLabel}>{row.label}</Text>
                <BriefValueText value={row.value} />
              </View>
            ))}
          </View>
        ) : null}

        <View wrap={false}>
          <Text style={styles.sectionLabel}>Investment breakdown</Text>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>{quote.serviceName}</Text>
            <Text style={styles.rowValue}>Service</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>{quote.packageName}</Text>
            <Text style={styles.rowValue}>
              {formatMoney(quote.packagePrice)}
            </Text>
          </View>
        </View>

        {quote.briefEstimate ? (
          <View wrap={false}>
            <Text style={styles.sectionLabel}>Suggested range</Text>
            <View style={styles.row}>
              <Text style={styles.rowLabel}>
                {formatMoney(quote.briefEstimate.low)} –{" "}
                {formatMoney(quote.briefEstimate.high)}
              </Text>
              <Text style={styles.rowValue}>From brief</Text>
            </View>
            {quote.briefEstimate.rationale.map((line) => (
              <Text key={line} style={styles.rationale}>
                · {line}
              </Text>
            ))}
          </View>
        ) : null}

        {quote.addons.length > 0 ? (
          <View wrap={false}>
            <Text style={styles.sectionLabel}>Add-ons</Text>
            {quote.addons.map((addon) => (
              <View key={addon.id} style={styles.row}>
                <Text style={styles.rowLabel}>{addon.name}</Text>
                <Text style={styles.rowValue}>{formatMoney(addon.price)}</Text>
              </View>
            ))}
          </View>
        ) : null}

        <View style={styles.totalRow} wrap={false}>
          <Text style={styles.totalLabel}>Estimated total</Text>
          <Text style={styles.totalValue}>
            {formatMoney(quote.totalPrice)}
          </Text>
        </View>
      </Page>
    </Document>
  );
}

export function proposalPdfFilename(quote: Quote) {
  return `proposal-${quote.quoteId.slice(0, 8)}.pdf`;
}

export async function buildProposalPdfBlob(quote: Quote): Promise<Blob> {
  return pdf(<ProposalDocument quote={quote} />).toBlob();
}

export async function buildProposalPdfBase64(quote: Quote): Promise<string> {
  const blob = await buildProposalPdfBlob(quote);
  const buffer = await blob.arrayBuffer();
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

interface ProposalPDFProps {
  quote: Quote;
}

export function ProposalPDF({ quote }: ProposalPDFProps) {
  async function handleDownload() {
    const blob = await buildProposalPdfBlob(quote);
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = proposalPdfFilename(quote);
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <Button type="button" variant="secondary" onClick={handleDownload}>
      Download PDF
    </Button>
  );
}
