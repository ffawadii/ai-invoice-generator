export type InvoiceItem = {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
};

export type Invoice = {
  id: string;
  clientId: string;
  number: string;
  client?: { name: string; address?: string };
  createdAt: string;
  issueDate?: string;
  dueDate?: string;
  notes?: string;
  taxRate?: number;
  items?: InvoiceItem[];
  total: number;
  currency: string;
  status: string;
  logoUrl?: string;
};

export type Client = {
  id: string;
  name: string;
  email?: string;
  address?: string;
  createdAt: string;
};
