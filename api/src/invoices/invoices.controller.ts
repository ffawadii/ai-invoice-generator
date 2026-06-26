import { Controller, Get, Post, Body, Patch, Put, Param, Delete, UseGuards, Res } from '@nestjs/common';
import { InvoicesService } from './invoices.service';
import { CreateInvoiceDto, UpdateInvoiceStatusDto, UpdateInvoiceDto } from './dto/invoice.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import type { Response } from 'express';

@UseGuards(JwtAuthGuard)
@Controller('invoices')
export class InvoicesController {
  constructor(private readonly invoicesService: InvoicesService) {}

  @Post()
  create(@CurrentUser() user: any, @Body() createInvoiceDto: CreateInvoiceDto) {
    return this.invoicesService.create(user.id, createInvoiceDto);
  }

  @Get()
  findAll(@CurrentUser() user: any) {
    return this.invoicesService.findAll(user.id);
  }

  @Get(':id')
  findOne(@CurrentUser() user: any, @Param('id') id: string) {
    return this.invoicesService.findOne(user.id, id);
  }

  @Patch(':id/status')
  updateStatus(@CurrentUser() user: any, @Param('id') id: string, @Body() updateInvoiceStatusDto: UpdateInvoiceStatusDto) {
    return this.invoicesService.updateStatus(user.id, id, updateInvoiceStatusDto);
  }

  @Delete(':id')
  remove(@CurrentUser() user: any, @Param('id') id: string) {
    return this.invoicesService.remove(user.id, id);
  }

  @Patch(':id')
  update(@CurrentUser() user: any, @Param('id') id: string, @Body() updateInvoiceDto: UpdateInvoiceDto) {
    return this.invoicesService.update(user.id, id, updateInvoiceDto);
  }

  @Get(':id/pdf')
  async getPdf(@CurrentUser() user: any, @Param('id') id: string, @Res() res: Response) {
    await this.invoicesService.generatePdf(user.id, id, res);
  }

  @Post(':id/send')
  async sendEmail(@CurrentUser() user: any, @Param('id') id: string) {
    return this.invoicesService.sendInvoiceEmail(user.id, id);
  }
}
