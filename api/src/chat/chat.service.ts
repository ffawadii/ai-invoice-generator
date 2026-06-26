import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { toolsSchema } from './tools.registry';
import { ClientsService } from '../clients/clients.service';
import { InvoicesService } from '../invoices/invoices.service';

@Injectable()
export class ChatService {
  private genAI: GoogleGenerativeAI;

  constructor(
    private configService: ConfigService,
    private clientsService: ClientsService,
    private invoicesService: InvoicesService,
  ) {
    this.genAI = new GoogleGenerativeAI(this.configService.get<string>('GEMINI_API_KEY')!);
  }

  async handleChat(userId: string, message: string, history: any[] = []) {
    const model = this.genAI.getGenerativeModel({
      model: 'gemini-3.1-flash-lite',
      tools: [{ functionDeclarations: toolsSchema }],
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

    while (response.functionCalls() && response.functionCalls()!.length > 0) {
      const call = response.functionCalls()![0];
      lastCall = call;

      let actionResult;
      try {
        if (call.name === 'find_or_create_client') {
          const { name, email, address } = call.args as any;
          const clients = await this.clientsService.findAll(userId);
          let client = clients.find(c => c.name.toLowerCase() === name.toLowerCase());
          if (!client) {
            client = await this.clientsService.create(userId, { name, email, address });
          }
          actionResult = client;
        } else if (call.name === 'create_invoice') {
          actionResult = await this.invoicesService.create(userId, call.args as any);
        } else if (call.name === 'update_invoice') {
          const { id, ...updateData } = call.args as any;
          if (!id) {
            actionResult = { error: 'You must provide an invoice ID to update an invoice.' };
          } else {
            actionResult = await this.invoicesService.update(userId, id, updateData);
          }
        } else if (call.name === 'list_invoices') {
          actionResult = await this.invoicesService.findAll(userId);
        } else {
          actionResult = { error: 'Unknown function call' };
        }
      } catch (e: any) {
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
}
