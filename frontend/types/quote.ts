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

export interface QuoteAddon {
  id: string;
  name: string;
  price: number;
}

export type BriefAnswers = Record<string, string>;

export interface Quote {
  quoteId: string;
  serviceId: string;
  serviceName: string;
  packageId: string;
  packageName: string;
  packagePrice: number;
  addons: QuoteAddon[];
  addonTotal: number;
  totalPrice: number;
  customerName: string;
  customerEmail: string;
  createdAt: string;
  brief?: BriefAnswers;
  briefEstimate?: {
    low: number;
    high: number;
    rationale: string[];
    source: "brief";
  };
  /** Set after client submits proposal and emails are sent */
  submittedAt?: string;
}

export interface CreateQuotePayload {
  serviceId: string;
  packageId?: string;
  addonIds: string[];
  customerName: string;
  customerEmail: string;
  customServiceNote?: string;
  brief?: BriefAnswers;
}

export type WizardStep =
  | "service"
  | "brief"
  | "package"
  | "addons"
  | "contact";
