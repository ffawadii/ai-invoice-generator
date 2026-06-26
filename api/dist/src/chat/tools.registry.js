"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toolsSchema = void 0;
const generative_ai_1 = require("@google/generative-ai");
exports.toolsSchema = [
    {
        name: 'find_or_create_client',
        description: 'Finds an existing client by name, or creates a new client. Returns the client details.',
        parameters: {
            type: generative_ai_1.SchemaType.OBJECT,
            properties: {
                name: { type: generative_ai_1.SchemaType.STRING, description: 'Client name' },
                email: { type: generative_ai_1.SchemaType.STRING, description: 'Client email' },
                address: { type: generative_ai_1.SchemaType.STRING, description: 'Client address' },
            },
            required: ['name'],
        },
    },
    {
        name: 'create_invoice',
        description: 'Creates a new invoice for a given client. If you only have the client name, you MUST use find_or_create_client first to get their ID.',
        parameters: {
            type: generative_ai_1.SchemaType.OBJECT,
            properties: {
                clientId: { type: generative_ai_1.SchemaType.STRING, description: 'ID of the client' },
                issueDate: { type: generative_ai_1.SchemaType.STRING, description: 'Issue date in YYYY-MM-DD format' },
                dueDate: { type: generative_ai_1.SchemaType.STRING, description: 'Due date in YYYY-MM-DD format' },
                currency: { type: generative_ai_1.SchemaType.STRING, description: 'Currency (e.g. USD, EUR)' },
                notes: { type: generative_ai_1.SchemaType.STRING, description: 'Notes or terms for the invoice' },
                taxRate: { type: generative_ai_1.SchemaType.NUMBER, description: 'Tax rate percentage' },
                items: {
                    type: generative_ai_1.SchemaType.ARRAY,
                    items: {
                        type: generative_ai_1.SchemaType.OBJECT,
                        properties: {
                            description: { type: generative_ai_1.SchemaType.STRING },
                            quantity: { type: generative_ai_1.SchemaType.NUMBER },
                            unitPrice: { type: generative_ai_1.SchemaType.NUMBER },
                        },
                        required: ['description', 'quantity', 'unitPrice'],
                    },
                },
            },
            required: ['clientId', 'items'],
        },
    },
    {
        name: 'list_invoices',
        description: 'Lists recent invoices for the user.',
        parameters: {
            type: generative_ai_1.SchemaType.OBJECT,
            properties: {},
        },
    },
    {
        name: 'update_invoice',
        description: 'Updates an existing invoice by its ID. You MUST provide the invoice ID. If the user only gives an invoice number, use list_invoices to find the ID first.',
        parameters: {
            type: generative_ai_1.SchemaType.OBJECT,
            properties: {
                id: { type: generative_ai_1.SchemaType.STRING, description: 'ID of the invoice to update' },
                clientId: { type: generative_ai_1.SchemaType.STRING, description: 'ID of the client' },
                issueDate: { type: generative_ai_1.SchemaType.STRING, description: 'Issue date in YYYY-MM-DD format' },
                dueDate: { type: generative_ai_1.SchemaType.STRING, description: 'Due date in YYYY-MM-DD format' },
                currency: { type: generative_ai_1.SchemaType.STRING, description: 'Currency (e.g. USD, EUR)' },
                notes: { type: generative_ai_1.SchemaType.STRING, description: 'Notes or terms for the invoice' },
                taxRate: { type: generative_ai_1.SchemaType.NUMBER, description: 'Tax rate percentage' },
                items: {
                    type: generative_ai_1.SchemaType.ARRAY,
                    items: {
                        type: generative_ai_1.SchemaType.OBJECT,
                        properties: {
                            description: { type: generative_ai_1.SchemaType.STRING },
                            quantity: { type: generative_ai_1.SchemaType.NUMBER },
                            unitPrice: { type: generative_ai_1.SchemaType.NUMBER },
                        },
                        required: ['description', 'quantity', 'unitPrice'],
                    },
                },
            },
            required: ['id'],
        },
    },
];
//# sourceMappingURL=tools.registry.js.map