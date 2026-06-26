import { FunctionDeclaration, SchemaType } from '@google/generative-ai';

export const toolsSchema: FunctionDeclaration[] = [
  {
    name: 'find_or_create_client',
    description: 'Finds an existing client by name, or creates a new client. Returns the client details.',
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        name: { type: SchemaType.STRING, description: 'Client name' },
        email: { type: SchemaType.STRING, description: 'Client email' },
        address: { type: SchemaType.STRING, description: 'Client address' },
      },
      required: ['name'],
    },
  },
  {
    name: 'create_invoice',
    description: 'Creates a new invoice for a given client. If you only have the client name, you MUST use find_or_create_client first to get their ID.',
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        clientId: { type: SchemaType.STRING, description: 'ID of the client' },
        issueDate: { type: SchemaType.STRING, description: 'Issue date in YYYY-MM-DD format' },
        dueDate: { type: SchemaType.STRING, description: 'Due date in YYYY-MM-DD format' },
        currency: { type: SchemaType.STRING, description: 'Currency (e.g. USD, EUR)' },
        notes: { type: SchemaType.STRING, description: 'Notes or terms for the invoice' },
        taxRate: { type: SchemaType.NUMBER, description: 'Tax rate percentage' },
        items: {
          type: SchemaType.ARRAY,
          items: {
            type: SchemaType.OBJECT,
            properties: {
              description: { type: SchemaType.STRING },
              quantity: { type: SchemaType.NUMBER },
              unitPrice: { type: SchemaType.NUMBER },
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
      type: SchemaType.OBJECT,
      properties: {},
    },
  },
  {
    name: 'update_invoice',
    description: 'Updates an existing invoice by its ID. You MUST provide the invoice ID. If the user only gives an invoice number, use list_invoices to find the ID first.',
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        id: { type: SchemaType.STRING, description: 'ID of the invoice to update' },
        clientId: { type: SchemaType.STRING, description: 'ID of the client' },
        issueDate: { type: SchemaType.STRING, description: 'Issue date in YYYY-MM-DD format' },
        dueDate: { type: SchemaType.STRING, description: 'Due date in YYYY-MM-DD format' },
        currency: { type: SchemaType.STRING, description: 'Currency (e.g. USD, EUR)' },
        notes: { type: SchemaType.STRING, description: 'Notes or terms for the invoice' },
        taxRate: { type: SchemaType.NUMBER, description: 'Tax rate percentage' },
        items: {
          type: SchemaType.ARRAY,
          items: {
            type: SchemaType.OBJECT,
            properties: {
              description: { type: SchemaType.STRING },
              quantity: { type: SchemaType.NUMBER },
              unitPrice: { type: SchemaType.NUMBER },
            },
            required: ['description', 'quantity', 'unitPrice'],
          },
        },
      },
      required: ['id'],
    },
  },
];
