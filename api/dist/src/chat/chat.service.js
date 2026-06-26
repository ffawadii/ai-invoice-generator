"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const generative_ai_1 = require("@google/generative-ai");
const tools_registry_1 = require("./tools.registry");
const clients_service_1 = require("../clients/clients.service");
const invoices_service_1 = require("../invoices/invoices.service");
let ChatService = class ChatService {
    configService;
    clientsService;
    invoicesService;
    genAI;
    constructor(configService, clientsService, invoicesService) {
        this.configService = configService;
        this.clientsService = clientsService;
        this.invoicesService = invoicesService;
        this.genAI = new generative_ai_1.GoogleGenerativeAI(this.configService.get('GEMINI_API_KEY'));
    }
    async handleChat(userId, message, history = []) {
        const model = this.genAI.getGenerativeModel({
            model: 'gemini-3.1-flash-lite',
            tools: [{ functionDeclarations: tools_registry_1.toolsSchema }],
            systemInstruction: 'You are an AI Invoice Assistant for an invoice generation app. Your sole purpose is to help users manage clients and create/update invoices. ' +
                'If a user asks to create an invoice for a specific client name, you must ALWAYS use the find_or_create_client tool first to obtain their clientId. Do not ask the user for the client ID if you only have their name. ' +
                'If a user asks to update an invoice but only gives the invoice number, you must ALWAYS use list_invoices first to find the corresponding invoice ID before calling update_invoice. ' +
                'CRITICAL GUARDRAIL: You must firmly decline to answer any questions or perform any tasks that are unrelated to invoices, clients, or the core features of this application.',
        });
        const formattedHistory = history.map(msg => ({
            role: msg.role === 'user' ? 'user' : 'model',
            parts: [
                { text: msg.text },
                ...(msg.context ? [{ text: `\n[System Context from Previous Action: ${JSON.stringify(msg.context)}]` }] : [])
            ]
        }));
        const chat = model.startChat({
            history: formattedHistory
        });
        let result = await chat.sendMessage(message);
        let response = result.response;
        let lastCall = null;
        let lastActionResult = null;
        while (response.functionCalls() && response.functionCalls().length > 0) {
            const call = response.functionCalls()[0];
            lastCall = call;
            let actionResult;
            try {
                if (call.name === 'find_or_create_client') {
                    const { name, email, address } = call.args;
                    const clients = await this.clientsService.findAll(userId);
                    let client = clients.find(c => c.name.toLowerCase() === name.toLowerCase());
                    if (!client) {
                        client = await this.clientsService.create(userId, { name, email, address });
                    }
                    actionResult = client;
                }
                else if (call.name === 'create_invoice') {
                    actionResult = await this.invoicesService.create(userId, call.args);
                }
                else if (call.name === 'update_invoice') {
                    const { id, ...updateData } = call.args;
                    if (!id) {
                        actionResult = { error: 'You must provide an invoice ID to update an invoice.' };
                    }
                    else {
                        actionResult = await this.invoicesService.update(userId, id, updateData);
                    }
                }
                else if (call.name === 'list_invoices') {
                    actionResult = await this.invoicesService.findAll(userId);
                }
                else {
                    actionResult = { error: 'Unknown function call' };
                }
            }
            catch (e) {
                actionResult = { error: e.message };
            }
            lastActionResult = actionResult;
            const finalResponse = (typeof actionResult === 'object' && actionResult !== null && !Array.isArray(actionResult))
                ? actionResult
                : { result: actionResult };
            result = await chat.sendMessage([{
                    functionResponse: {
                        name: call.name,
                        response: finalResponse,
                    }
                }]);
            response = result.response;
        }
        return {
            text: response.text(),
            proposedAction: lastCall,
            actionResult: lastActionResult
        };
    }
};
exports.ChatService = ChatService;
exports.ChatService = ChatService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService,
        clients_service_1.ClientsService,
        invoices_service_1.InvoicesService])
], ChatService);
//# sourceMappingURL=chat.service.js.map