import { InvoiceStatus } from '@prisma/client';
export declare class InvoiceItemDto {
    description: string;
    quantity: number;
    unitPrice: number;
}
export declare class CreateInvoiceDto {
    clientId: string;
    number?: string;
    issueDate?: string;
    dueDate?: string;
    currency?: string;
    notes?: string;
    taxRate?: number;
    items: InvoiceItemDto[];
    logo?: string;
}
export declare class UpdateInvoiceStatusDto {
    status: InvoiceStatus;
}
export declare class UpdateInvoiceDto {
    clientId?: string;
    number?: string;
    issueDate?: string;
    dueDate?: string;
    currency?: string;
    notes?: string;
    taxRate?: number;
    items?: InvoiceItemDto[];
    logo?: string;
}
