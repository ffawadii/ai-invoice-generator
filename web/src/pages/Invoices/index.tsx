import { Link } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { useGetQuery } from '../../hooks/useGetQuery';
import { useUpdateMutation } from '../../hooks/useUpdateMutation';
import { useCreateMutation } from '../../hooks/useCreateMutation';
import { api } from '../../lib/axios';
import { queryKeys, endpoints } from '../../endpoints';
import type { Invoice } from '../../shared';
import { Download, CheckCircle, Clock, Plus, Copy, CopyPlus, Mail } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export function InvoicesList() {
  const queryClient = useQueryClient();

  const { data: invoices, isLoading } = useGetQuery<Invoice[]>(queryKeys.invoices, endpoints.invoices);

  const downloadPdf = async (id: string, number: string) => {
    try {
      const res = await api.get(endpoints.invoicePdf(id), { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `invoice-${number}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
    } catch (e) {
      console.error(e);
      alert('Failed to download PDF');
    }
  };

  const updateStatus = useUpdateMutation({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.invoices });
    }
  });

  const sendEmail = useCreateMutation({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.invoices });
      toast.success('Invoice sent successfully via email!');
    },
    onError: () => {
      toast.error('Failed to send email. Check your API key and verified domain.');
    }
  });

  if (isLoading) return <div className="p-8 text-muted-foreground animate-pulse">Loading invoices...</div>;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Invoices</h1>
          <p className="text-muted-foreground mt-1">Manage and track your invoices.</p>
        </div>
        <Link to="/invoices/new">
          <Button>
            <Plus className="w-4 h-4 mr-2" /> Create Invoice
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader className="px-6 py-4 border-b">
          <CardTitle>Recent Invoices</CardTitle>
          <CardDescription>A list of your recently created or updated invoices.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="pl-6">Number</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="pr-6 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoices?.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                    No invoices found. Use the Chat to create one!
                  </TableCell>
                </TableRow>
              )}
              {invoices?.map((invoice: Invoice) => (
                <TableRow key={invoice.id} className="group">
                  <TableCell className="pl-6 font-medium">
                    <div className="flex items-center gap-2">
                      {invoice.number}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          navigator.clipboard.writeText(invoice.number);
                          toast.success('Invoice number copied');
                        }}
                        title="Copy Invoice ID"
                      >
                        <Copy className="w-3 h-3 text-muted-foreground" />
                      </Button>
                    </div>
                  </TableCell>
                  <TableCell>{invoice.client?.name || 'Unknown'}</TableCell>
                  <TableCell>{new Date(invoice.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell className="font-semibold">
                    {(() => {
                      const getCurrencySymbol = (code: string) => {
                        switch (code) {
                          case 'USD': return '$';
                          case 'EUR': return '€';
                          case 'GBP': return '£';
                          case 'CAD': return 'C$';
                          case 'AUD': return 'A$';
                          case 'INR': return '₹';
                          case 'JPY': return '¥';
                          case 'PKR': return '₨';
                          default: return code + ' ';
                        }
                      };
                      return `${getCurrencySymbol(invoice.currency || 'USD')}${invoice.total}`;
                    })()}
                  </TableCell>
                  <TableCell>
                    {invoice.status === 'PAID' && <Badge variant="default" className="bg-green-600 hover:bg-green-700"><CheckCircle className="w-3 h-3 mr-1" /> PAID</Badge>}
                    {invoice.status === 'DRAFT' && <Badge variant="secondary"><Clock className="w-3 h-3 mr-1" /> DRAFT</Badge>}
                    {invoice.status === 'SENT' && <Badge variant="default" className="bg-blue-600 hover:bg-blue-700">SENT</Badge>}
                    {invoice.status === 'OVERDUE' && <Badge variant="destructive">OVERDUE</Badge>}
                    {['PAID', 'DRAFT', 'SENT', 'OVERDUE'].indexOf(invoice.status) === -1 && (
                      <Badge variant="outline">{invoice.status}</Badge>
                    )}
                  </TableCell>
                  <TableCell className="pr-6 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button variant="ghost" size="icon" onClick={() => downloadPdf(invoice.id, invoice.number)} title="Download PDF">
                        <Download className="w-4 h-4" />
                      </Button>
                      
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => sendEmail.mutate({ url: `${endpoints.invoice(invoice.id)}/send`, data: {} })} 
                        title="Send via Email"
                        disabled={sendEmail.isPending}
                      >
                        <Mail className={`w-4 h-4 ${sendEmail.isPending ? 'opacity-50' : 'text-blue-600'}`} />
                      </Button>

                      <Link 
                        to="/invoices/new" 
                        state={{ duplicate: invoice }} 
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Button variant="ghost" size="icon" title="Duplicate Invoice">
                          <CopyPlus className="w-4 h-4" />
                        </Button>
                      </Link>
                      {invoice.status === 'DRAFT' && (
                        <Link to={`/invoices/${invoice.id}/edit`}>
                          <Button variant="outline" size="sm">
                            Edit
                          </Button>
                        </Link>
                      )}
                      {invoice.status !== 'PAID' && (
                        <Button variant="outline" size="sm" onClick={() => updateStatus.mutate({ url: endpoints.invoiceStatus(invoice.id), data: { status: 'PAID' } })} className="text-green-600 border-green-200 hover:bg-green-50 hover:text-green-700 dark:hover:bg-green-950/50">
                          Mark Paid
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
