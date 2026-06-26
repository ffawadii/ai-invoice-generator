import { ChatService } from './chat.service';
export declare class ChatController {
    private readonly chatService;
    constructor(chatService: ChatService);
    chat(user: any, message: string, history: any[]): Promise<{
        text: string;
        proposedAction: import("@google/generative-ai").FunctionCall | null;
        actionResult: {
            email: string | null;
            name: string;
            id: string;
            createdAt: Date;
            address: string | null;
            userId: string;
        } | ({
            client: {
                email: string | null;
                name: string;
                id: string;
                createdAt: Date;
                address: string | null;
                userId: string;
            };
            items: {
                id: string;
                description: string;
                quantity: number;
                unitPrice: import("@prisma/client-runtime-utils").Decimal;
                lineTotal: import("@prisma/client-runtime-utils").Decimal;
                invoiceId: string;
            }[];
        } & {
            number: string;
            from: string | null;
            id: string;
            createdAt: Date;
            userId: string;
            clientId: string;
            issueDate: Date | null;
            dueDate: Date | null;
            currency: string;
            notes: string | null;
            taxRate: import("@prisma/client-runtime-utils").Decimal;
            status: import("@prisma/client").$Enums.InvoiceStatus;
            logoUrl: string | null;
            billTo: string | null;
            shipTo: string | null;
            paymentTerms: string | null;
            poNumber: string | null;
            terms: string | null;
            subtotal: import("@prisma/client-runtime-utils").Decimal;
            taxAmount: import("@prisma/client-runtime-utils").Decimal;
            discount: import("@prisma/client-runtime-utils").Decimal | null;
            shipping: import("@prisma/client-runtime-utils").Decimal | null;
            total: import("@prisma/client-runtime-utils").Decimal;
            amountPaid: import("@prisma/client-runtime-utils").Decimal | null;
            updatedAt: Date;
        }) | ({
            client: {
                email: string | null;
                name: string;
                id: string;
                createdAt: Date;
                address: string | null;
                userId: string;
            };
        } & {
            number: string;
            from: string | null;
            id: string;
            createdAt: Date;
            userId: string;
            clientId: string;
            issueDate: Date | null;
            dueDate: Date | null;
            currency: string;
            notes: string | null;
            taxRate: import("@prisma/client-runtime-utils").Decimal;
            status: import("@prisma/client").$Enums.InvoiceStatus;
            logoUrl: string | null;
            billTo: string | null;
            shipTo: string | null;
            paymentTerms: string | null;
            poNumber: string | null;
            terms: string | null;
            subtotal: import("@prisma/client-runtime-utils").Decimal;
            taxAmount: import("@prisma/client-runtime-utils").Decimal;
            discount: import("@prisma/client-runtime-utils").Decimal | null;
            shipping: import("@prisma/client-runtime-utils").Decimal | null;
            total: import("@prisma/client-runtime-utils").Decimal;
            amountPaid: import("@prisma/client-runtime-utils").Decimal | null;
            updatedAt: Date;
        })[] | {
            error: any;
        } | null;
    }>;
}
