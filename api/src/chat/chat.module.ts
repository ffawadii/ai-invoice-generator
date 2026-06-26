import { Module } from '@nestjs/common';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';
import { ClientsModule } from '../clients/clients.module';
import { InvoicesModule } from '../invoices/invoices.module';

@Module({
  imports: [ClientsModule, InvoicesModule],
  controllers: [ChatController],
  providers: [ChatService]
})
export class ChatModule {}
