export type NestPlan = {
  id: string;
  code: string;
  nameFa: string;
  nameEn: string;
  descriptionFa: string | null;
  descriptionEn: string | null;
  isPublished: boolean;
  sortOrder: number;
};

export type DashboardPlan = {
  id: string;
  code: string;
  name: string;
  description: string | null;
  sortOrder: number;
};

export type NestPlanRequest = {
  id: string;
  planId: string;
  status: string;
  contactName: string;
  contactPhone: string | null;
  contactEmail: string | null;
  websiteDomain: string | null;
  notes: string | null;
  plan?: NestPlan | null;
  createdAt: string;
  updatedAt: string;
};

export type CreatePlanRequestInput = {
  planId: string;
  contactName: string;
  contactPhone?: string;
  contactEmail?: string;
  websiteDomain?: string;
  notes?: string;
};
