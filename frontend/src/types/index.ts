// ============================================
// Domain Types – Mirror of Prisma Schema
// ============================================

export type ProjectStatus =
  | "PLANNING"
  | "APPROVED"
  | "UNDER_CONSTRUCTION"
  | "COMMISSIONED"
  | "OPERATIONAL"
  | "DECOMMISSIONED";

export type LegalReviewStatus =
  | "PENDING"
  | "IN_REVIEW"
  | "APPROVED"
  | "REJECTED"
  | "REQUIRES_CLARIFICATION";

export type RoofType =
  | "FLAT"
  | "PITCHED"
  | "SAWTOOTH"
  | "METAL_SHEET"
  | "OTHER";

export interface CommercialClient {
  id: string;
  companyName: string;
  contactPerson: string;
  email: string;
  phone: string | null;
  address: string;
  city: string;
  postalCode: string;
  taxId: string | null;
  projects?: SolarProject[];
  createdAt: string;
  updatedAt: string;
}

export interface SolarProject {
  id: string;
  projectName: string;
  status: ProjectStatus;
  plannedKwp: number;
  estimatedYieldKwh: number | null;
  roofType: RoofType;
  roofAreaSqm: number | null;
  plannedStartDate: string | null;
  commissioningDate: string | null;
  latitude: number | null;
  longitude: number | null;
  clientId: string;
  client?: Partial<CommercialClient>;
  landRegistries?: LandRegistry[];
  createdAt: string;
  updatedAt: string;
}

export interface LandRegistry {
  id: string;
  gemarkung: string;
  flurstueck: string;
  ownerName: string;
  ownerAddress: string | null;
  legalStatus: LegalReviewStatus;
  legalNotes: string | null;
  lastCheckedAt: string | null;
  latitude: number | null;
  longitude: number | null;
  projectId: string;
  project?: Partial<SolarProject> & { client?: Partial<CommercialClient> };
  createdAt: string;
  updatedAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  count?: number;
}

// ---- Display Helpers ----

export const PROJECT_STATUS_LABELS: Record<ProjectStatus, string> = {
  PLANNING: "In Planung",
  APPROVED: "Genehmigt",
  UNDER_CONSTRUCTION: "Im Bau",
  COMMISSIONED: "In Betrieb genommen",
  OPERATIONAL: "In Betrieb",
  DECOMMISSIONED: "Stillgelegt",
};

export const LEGAL_STATUS_LABELS: Record<LegalReviewStatus, string> = {
  PENDING: "Ausstehend",
  IN_REVIEW: "In Prüfung",
  APPROVED: "Genehmigt",
  REJECTED: "Abgelehnt",
  REQUIRES_CLARIFICATION: "Klärung nötig",
};

export const ROOF_TYPE_LABELS: Record<RoofType, string> = {
  FLAT: "Flachdach",
  PITCHED: "Satteldach",
  SAWTOOTH: "Sheddach",
  METAL_SHEET: "Blechdach",
  OTHER: "Sonstige",
};
