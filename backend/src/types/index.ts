export interface Service {
  id: string;
  name: string;
  description: string;
}

export interface Package {
  id: string;
  name: string;
  description: string;
  price: number;
  serviceId: string;
}

export interface Addon {
  id: string;
  name: string;
  description: string;
  price: number;
  serviceId: string;
}

export interface PricingCatalog {
  services: Service[];
  packages: Package[];
  addons: Addon[];
}

export type BriefAnswers = Record<string, string>;

export interface Quote {
  quoteId: string;
  serviceId: string;
  serviceName: string;
  packageId: string;
  packageName: string;
  packagePrice: number;
  addons: Array<{
    id: string;
    name: string;
    price: number;
  }>;
  addonTotal: number;
  totalPrice: number;
  customerName: string;
  customerEmail: string;
  createdAt: string;
  brief?: BriefAnswers;
  /** Present when total was derived from the client brief */
  briefEstimate?: {
    low: number;
    high: number;
    rationale: string[];
    source: "brief";
  };
  submittedAt?: string;
}

export interface CreateQuoteInput {
  serviceId: string;
  packageId?: string;
  addonIds: string[];
  customerName: string;
  customerEmail: string;
  customServiceNote?: string;
  brief?: BriefAnswers;
}
