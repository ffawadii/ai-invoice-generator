import { useEffect, useState } from 'react';
import { useForm, useFieldArray, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { invoiceSchema, type InvoiceFormData } from './constant';
import { Plus, RefreshCw, Trash2, X } from 'lucide-react';
import { useGetQuery } from '../../hooks/useGetQuery';
import { queryKeys, endpoints } from '../../endpoints';
import type { Client, Invoice } from '../../shared';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Field, FieldLabel, FieldError } from '@/components/ui/field';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { InputGroup, InputGroupAddon, InputGroupInput, InputGroupText } from '@/components/ui/input-group';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { useCreateMutation } from '../../hooks/useCreateMutation';
import { useUpdateMutation } from '../../hooks/useUpdateMutation';
import { defaultInvoiceValues } from './constant';


interface IInvoiceForm {
  formData?: Partial<InvoiceFormData>;
  onSubmit?: (data: InvoiceFormData) => void;
}

export function InvoiceForm({ formData, onSubmit }: IInvoiceForm) {
  const { register, control, handleSubmit, setValue, getValues, formState: { errors } } = useForm<InvoiceFormData>(
    {
      resolver: zodResolver(invoiceSchema as any),
      defaultValues: formData || defaultInvoiceValues
    });

  const { data: clients } = useGetQuery<Client[]>(queryKeys.clients, endpoints.clients);

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'items'
  });

  const watchItems = useWatch({ control, name: 'items' }) || [];
  const taxRate = useWatch({ control, name: 'taxRate' }) || 0;
  const discount = useWatch({ control, name: 'discount' }) || 0;
  const shipping = useWatch({ control, name: 'shipping' }) || 0;
  const amountPaid = useWatch({ control, name: 'amountPaid' }) || 0;
  const currency = useWatch({ control, name: 'currency' }) || 'USD';

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
  const sym = getCurrencySymbol(currency);

  const [showDiscount, setShowDiscount] = useState(discount > 0);
  const [showShipping, setShowShipping] = useState(shipping > 0);

  const [logoPreview, setLogoPreview] = useState<string | null>(formData?.logo || null);
  const [logoError, setLogoError] = useState<string | null>(null);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 1024 * 1024) { // 1MB
        setLogoError('Logo must be less than 1MB');
        toast.error('Max file size allowed is 1 MB');
        e.target.value = '';
        return;
      }
      setLogoError(null);
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
        setValue('logo', reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Auto-calculate totals
  useEffect(() => {
    let sub = 0;
    watchItems.forEach((item: any, index: number) => {
      const q = item.quantity || 0;
      const r = item.rate || 0;
      const amt = q * r;
      sub += amt;
      if (getValues(`items.${index}.amount`) !== amt) {
        setValue(`items.${index}.amount`, amt);
      }
    });

    const taxAmount = sub * (taxRate / 100);
    const total = sub + taxAmount - discount + shipping;
    const balance = total - amountPaid;

    if (getValues('subtotal') !== sub) setValue('subtotal', sub);
    if (getValues('taxAmount') !== taxAmount) setValue('taxAmount', taxAmount);
    if (getValues('total') !== total) setValue('total', total);
    if (getValues('balanceDue') !== balance) setValue('balanceDue', balance);
  }, [watchItems, taxRate, discount, shipping, amountPaid, setValue, getValues]);

  const subtotal = useWatch({ control, name: 'subtotal' }) || 0;
  const total = useWatch({ control, name: 'total' }) || 0;
  const balanceDue = useWatch({ control, name: 'balanceDue' }) || 0;

  const handleFormSubmit = (data: any) => {
    if (onSubmit) onSubmit(data as InvoiceFormData);
  };

  return (
    <Card className="max-w-5xl mx-auto my-8 border-none shadow-none md:border md:shadow-sm">
      <CardContent className="p-6 md:p-12">
        <form onSubmit={handleSubmit(handleFormSubmit)}>

          {/* Top Header Section */}
          <div className="flex flex-col md:flex-row justify-between items-start mb-10 gap-8">
            <div>
              <div className="relative w-48 h-32 bg-muted/50 flex flex-col items-center justify-center text-muted-foreground rounded-lg cursor-pointer hover:bg-muted transition border border-dashed border-border overflow-hidden group">
                <input type="hidden" {...register('logo')} />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="absolute inset-0 opacity-0 cursor-pointer z-10"
                />
                {logoPreview ? (
                  <>
                    <img src={logoPreview} alt="Logo" className="w-full h-full object-contain p-2" />
                    <div className="absolute inset-0 bg-black/50 hidden group-hover:flex items-center justify-center text-white">
                      <span className="text-sm font-medium">Change Logo</span>
                    </div>
                  </>
                ) : (
                  <>
                    <Plus className="w-6 h-6 mb-1" />
                    <span className="text-sm font-medium">Add Logo</span>
                  </>
                )}
              </div>
              {logoError && <span className="text-destructive text-sm mt-2 block font-medium">{logoError}</span>}
            </div>

            <div className="text-left md:text-right flex flex-col md:items-end w-full md:w-auto">
              <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">INVOICE</h1>
              <div className="flex items-center">
                <span className="text-muted-foreground mr-2 font-medium">#</span>
                <Input
                  {...register('number')}
                  className="text-right w-32"
                  placeholder="1"
                />
              </div>
            </div>
          </div>

          {/* Info Grid Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-12">
            {/* Left Column (From / To) */}
            <div className="flex flex-col gap-6">
              <div>
                <Textarea
                  {...register('from')}
                  className="h-24 resize-none bg-muted/20"
                  placeholder="Who is this from?"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field>
                  <div className="flex justify-between items-center mb-2">
                    <FieldLabel>Bill To</FieldLabel>
                    <div className="w-40">
                      <select
                        className="flex h-8 w-full items-center justify-between rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm ring-offset-background focus:outline-none focus:ring-1 focus:ring-ring"
                        {...register('clientId')}
                        onChange={(e) => {
                          setValue('clientId', e.target.value);
                          const client = clients?.find(c => c.id === e.target.value);
                          if (client) {
                            setValue('billTo', `${client.name}\n${client.address || ''}`.trim());
                          }
                        }}
                      >
                        <option value="">Select client</option>
                        {clients?.map(client => (
                          <option key={client.id} value={client.id}>{client.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <Textarea
                    {...register('billTo')}
                    className="h-24 resize-none bg-muted/20"
                    placeholder="Who is this to?"
                  />
                  <FieldError errors={[errors.billTo]} />
                </Field>
                <Field>
                  <FieldLabel className="mb-2">Ship To</FieldLabel>
                  <Textarea
                    {...register('shipTo')}
                    className="h-24 resize-none bg-muted/20"
                    placeholder="(optional)"
                  />
                  <FieldError errors={[errors.shipTo]} />
                </Field>
              </div>
            </div>

            {/* Right Column (Dates / Terms) */}
            <div className="flex flex-col gap-4 md:items-end mt-4">
              <Field orientation="horizontal" className="flex items-center gap-4 w-full md:w-80">
                <FieldLabel className="w-32 flex-none md:justify-end md:text-right">Date</FieldLabel>
                <div className="flex-1">
                  <Input {...register('date')} type="date" />
                  <FieldError errors={[errors.date]} />
                </div>
              </Field>
              <Field orientation="horizontal" className="flex items-center gap-4 w-full md:w-80">
                <FieldLabel className="w-32 flex-none md:justify-end md:text-right">Payment Terms</FieldLabel>
                <div className="flex-1">
                  <Input {...register('paymentTerms')} placeholder="Net 30" />
                  <FieldError errors={[errors.paymentTerms]} />
                </div>
              </Field>
              <Field orientation="horizontal" className="flex items-center gap-4 w-full md:w-80">
                <FieldLabel className="w-32 flex-none md:justify-end md:text-right">Due Date</FieldLabel>
                <div className="flex-1">
                  <Input {...register('dueDate')} type="date" />
                  <FieldError errors={[errors.dueDate]} />
                </div>
              </Field>
              <Field orientation="horizontal" className="flex items-center gap-4 w-full md:w-80">
                <FieldLabel className="w-32 flex-none md:justify-end md:text-right">PO Number</FieldLabel>
                <div className="flex-1">
                  <Input {...register('poNumber')} />
                  <FieldError errors={[errors.poNumber]} />
                </div>
              </Field>
              <Field orientation="horizontal" className="flex items-center gap-4 w-full md:w-80">
                <FieldLabel className="w-32 flex-none md:justify-end md:text-right">Currency</FieldLabel>
                <div className="flex-1">
                  <select
                    className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background focus:outline-none focus:ring-1 focus:ring-ring"
                    {...register('currency')}
                  >
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="GBP">GBP (£)</option>
                    <option value="CAD">CAD (C$)</option>
                    <option value="AUD">AUD (A$)</option>
                    <option value="INR">INR (₹)</option>
                    <option value="JPY">JPY (¥)</option>
                    <option value="PKR">PKR (₨)</option>
                  </select>
                </div>
              </Field>
            </div>
          </div>

          {/* Line Items Table */}
          <div className="mb-8 overflow-x-auto">
            <div className="min-w-[600px]">
              <div className="bg-muted text-muted-foreground flex gap-2 rounded-t-md text-sm font-semibold mb-2 py-2">
                <div className="flex-1 px-3">Item</div>
                <div className="w-24 px-3 text-right">Qty</div>
                <div className="w-32 px-3 text-right">Rate</div>
                <div className="w-32 px-3 text-right">Amount</div>
                <div className="w-10"></div>
              </div>

              <div className="flex flex-col gap-2">
                {fields.map((field, index) => (
                  <div key={field.id} className="flex gap-2 items-start group">
                    <div className="flex-1">
                      <Field>
                        <Input
                          {...register(`items.${index}.description`)}
                          placeholder="Description of item/service..."
                        />
                        <FieldError errors={[(errors.items as any)?.[index]?.description]} />
                      </Field>
                    </div>
                    <div className="w-24">
                      <Input
                        type="number"
                        {...register(`items.${index}.quantity`, { valueAsNumber: true })}
                      />
                    </div>
                    <div className="w-32">
                      <InputGroup>
                        <InputGroupAddon>
                          <InputGroupText>{sym}</InputGroupText>
                        </InputGroupAddon>
                        <InputGroupInput
                          type="number"
                          step="0.01"
                          {...register(`items.${index}.rate`, { valueAsNumber: true })}
                        />
                      </InputGroup>
                    </div>
                    <div className="w-32 flex items-center justify-end p-2 bg-muted/20 border border-input rounded-md text-sm">
                      {sym}{(watchItems[index]?.amount || 0).toFixed(2)}
                    </div>

                    <div className="w-10 flex items-center justify-center pt-1">
                      {fields.length > 1 && (
                        <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)} className="text-destructive hover:text-destructive hover:bg-destructive/10 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <Button
                type="button"
                variant="outline"
                onClick={() => append({ description: '', quantity: 1, rate: 0, amount: 0 })}
                className="mt-4 text-primary hover:text-primary"
              >
                <Plus className="w-4 h-4 mr-2" /> Add Line Item
              </Button>
            </div>
          </div>

          <Separator className="my-8" />

          {/* Footer Area (Notes + Totals) */}
          <div className="flex flex-col lg:flex-row gap-12 mt-8">

            {/* Notes and Terms */}
            <div className="flex-1 flex flex-col gap-6">
              <Field>
                <FieldLabel className="mb-2">Notes</FieldLabel>
                <Textarea
                  {...register('notes')}
                  className="h-20 resize-none bg-muted/20"
                  placeholder="Notes - any relevant information not already covered"
                />
                <FieldError errors={[errors.notes]} />
              </Field>
              <Field>
                <FieldLabel className="mb-2">Terms</FieldLabel>
                <Textarea
                  {...register('terms')}
                  className="h-20 resize-none bg-muted/20"
                  placeholder="Terms and conditions - late fees, payment methods, delivery schedule"
                />
                <FieldError errors={[errors.terms]} />
              </Field>
            </div>

            {/* Totals */}
            <div className="w-full lg:w-80 flex flex-col gap-4">
              <div className="flex justify-between items-center py-2 border-b border-border text-sm">
                <span className="text-muted-foreground font-medium">Subtotal</span>
                <span className="font-medium">{sym}{subtotal.toFixed(2)}</span>
              </div>

              <div className="flex items-center gap-2">
                <FieldLabel className="w-20 text-muted-foreground font-normal">Tax</FieldLabel>
                <div className="flex-1">
                  <InputGroup>
                    <InputGroupInput
                      type="number"
                      step="0.01"
                      {...register('taxRate', { valueAsNumber: true })}
                      className="text-right"
                    />
                    <InputGroupAddon>
                      <InputGroupText>%</InputGroupText>
                    </InputGroupAddon>
                  </InputGroup>
                </div>
                <Button type="button" variant="outline" size="icon">
                  <RefreshCw className="w-4 h-4 text-muted-foreground" />
                </Button>
              </div>

              <div className="flex gap-4 my-1">
                {!showDiscount && (
                  <Button type="button" variant="link" onClick={() => setShowDiscount(true)} className="p-0 h-auto text-primary">
                    <Plus className="w-3 h-3 mr-1" /> Discount
                  </Button>
                )}
                {!showShipping && (
                  <Button type="button" variant="link" onClick={() => setShowShipping(true)} className="p-0 h-auto text-primary">
                    <Plus className="w-3 h-3 mr-1" /> Shipping
                  </Button>
                )}
              </div>

              {showDiscount && (
                <div className="flex items-center gap-2">
                  <FieldLabel className="w-20 text-muted-foreground font-normal">Discount</FieldLabel>
                  <div className="flex-1">
                    <InputGroup>
                      <InputGroupAddon>
                        <InputGroupText>{sym}</InputGroupText>
                      </InputGroupAddon>
                      <InputGroupInput
                        type="number"
                        step="0.01"
                        {...register('discount', { valueAsNumber: true })}
                      />
                    </InputGroup>
                  </div>
                  <Button type="button" variant="ghost" size="icon" onClick={() => { setShowDiscount(false); setValue('discount', 0); }} className="text-destructive hover:text-destructive hover:bg-destructive/10">
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              )}

              {showShipping && (
                <div className="flex items-center gap-2">
                  <FieldLabel className="w-20 text-muted-foreground font-normal">Shipping</FieldLabel>
                  <div className="flex-1">
                    <InputGroup>
                      <InputGroupAddon>
                        <InputGroupText>{sym}</InputGroupText>
                      </InputGroupAddon>
                      <InputGroupInput
                        type="number"
                        step="0.01"
                        {...register('shipping', { valueAsNumber: true })}
                      />
                    </InputGroup>
                  </div>
                  <Button type="button" variant="ghost" size="icon" onClick={() => { setShowShipping(false); setValue('shipping', 0); }} className="text-destructive hover:text-destructive hover:bg-destructive/10">
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              )}

              <Separator className="my-2" />

              <div className="flex justify-between items-center py-3 border-b-2 border-border font-bold text-lg">
                <span>Total</span>
                <span>{sym}{total.toFixed(2)}</span>
              </div>

              <div className="flex items-center gap-2 mt-2">
                <FieldLabel className="w-28 text-muted-foreground font-normal">Amount Paid</FieldLabel>
                <div className="flex-1">
                  <InputGroup>
                    <InputGroupAddon>
                      <InputGroupText>{sym}</InputGroupText>
                    </InputGroupAddon>
                    <InputGroupInput
                      type="number"
                      step="0.01"
                      {...register('amountPaid', { valueAsNumber: true })}
                    />
                  </InputGroup>
                </div>
              </div>

              <Separator className="my-2" />

              <div className="flex justify-between items-center py-3 font-bold text-slate-800 text-lg mt-2">
                <span>Balance Due</span>
                <span>{sym}{balanceDue.toFixed(2)}</span>
              </div>

              <Button type="submit" size="lg" className="w-full">
                Save Invoice
              </Button>
            </div>
          </div>

        </form>
      </CardContent>
    </Card>
  );
}



export function NewInvoice() {
  const navigate = useNavigate();
  const location = useLocation();
  const duplicateData = location.state?.duplicate;

  const createClient = useCreateMutation();
  const createInvoice = useCreateMutation();

  let initialData = undefined;
  if (duplicateData) {
    initialData = {
      clientId: duplicateData.clientId,
      currency: duplicateData.currency || 'USD',
      logo: duplicateData.logoUrl || undefined,
      billTo: duplicateData.client ? `${duplicateData.client.name}\n${duplicateData.client.address || ''}`.trim() : '',
      date: duplicateData.issueDate ? new Date(duplicateData.issueDate).toISOString().split('T')[0] : '',
      dueDate: duplicateData.dueDate ? new Date(duplicateData.dueDate).toISOString().split('T')[0] : '',
      notes: duplicateData.notes || '',
      taxRate: Number(duplicateData.taxRate) || 0,
      items: duplicateData.items?.map((item: any) => ({
        description: item.description,
        quantity: item.quantity,
        rate: Number(item.unitPrice),
        amount: Number(item.lineTotal)
      })) || []
    };
  }

  const handleSubmit = async (data: any) => {
    try {
      let clientId = data.clientId;
      if (!clientId) {
        // Create a client implicitly from billTo
        const lines = data.billTo.split('\n');
        const clientName = lines[0] || 'Unknown Client';
        const clientAddress = lines.slice(1).join('\n');

        const clientRes = await createClient.mutateAsync({
          url: endpoints.clients,
          data: { name: clientName, address: clientAddress }
        });
        clientId = clientRes.id;
      }

      // Map frontend form data to backend DTO
      const payload = {
        clientId,
        number: data.number,
        issueDate: data.date ? new Date(data.date).toISOString() : undefined,
        dueDate: data.dueDate ? new Date(data.dueDate).toISOString() : undefined,
        currency: data.currency || 'USD',
        notes: data.notes,
        taxRate: data.taxRate,
        items: data.items.map((item: any) => ({
          description: item.description,
          quantity: item.quantity,
          unitPrice: item.rate
        })),
        logo: data.logo
      };

      await createInvoice.mutateAsync({ url: endpoints.invoices, data: payload });
      navigate('/');
    } catch (error) {
      console.error('Failed to save invoice:', error);
      alert('Failed to save invoice. Please try again.');
    }
  };

  return (
    <div className="pb-12">
      <div className="max-w-4xl mx-auto mb-4">
        <h1 className="text-2xl font-bold text-slate-800">
          {duplicateData ? 'Duplicate Invoice' : 'Create New Invoice'}
        </h1>
      </div>
      <InvoiceForm formData={initialData} onSubmit={handleSubmit} />
    </div>
  );
}

export function EditInvoice() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: invoice, isLoading } = useGetQuery<Invoice>(
    [...queryKeys.invoices, id],
    endpoints.invoice(id!)
  );
  const updateInvoice = useUpdateMutation();

  if (isLoading) return <div className="p-8">Loading invoice...</div>;
  if (!invoice) return <div className="p-8">Invoice not found.</div>;

  const handleSubmit = async (data: any) => {
    try {
      const payload = {
        clientId: data.clientId,
        number: data.number,
        issueDate: data.date ? new Date(data.date).toISOString() : undefined,
        dueDate: data.dueDate ? new Date(data.dueDate).toISOString() : undefined,
        currency: data.currency || 'USD',
        notes: data.notes,
        taxRate: data.taxRate,
        items: data.items.map((item: any) => ({
          description: item.description,
          quantity: item.quantity,
          unitPrice: item.rate
        })),
        logo: data.logo
      };

      await updateInvoice.mutateAsync({ url: endpoints.invoice(id!), data: payload });
      navigate('/');
    } catch (error) {
      console.error('Failed to update invoice:', error);
      alert('Failed to update invoice. It might not be in DRAFT status.');
    }
  };

  const formData = {
    clientId: invoice.clientId,
    number: invoice.number,
    currency: invoice.currency || 'USD',
    logo: invoice.logoUrl || undefined,
    billTo: invoice.client ? `${invoice.client.name}\n${invoice.client.address || ''}` : '',
    date: invoice.issueDate ? new Date(invoice.issueDate).toISOString().split('T')[0] : '',
    dueDate: invoice.dueDate ? new Date(invoice.dueDate).toISOString().split('T')[0] : '',
    notes: invoice.notes || '',
    taxRate: Number(invoice.taxRate) || 0,
    items: invoice.items?.map((item: any) => ({
      description: item.description,
      quantity: item.quantity,
      rate: Number(item.unitPrice),
      amount: Number(item.lineTotal)
    })) || []
  };

  return (
    <div className="pb-12">
      <div className="max-w-4xl mx-auto mb-4 px-4 md:px-0">
        <h1 className="text-2xl font-bold text-slate-800">Edit Invoice</h1>
      </div>
      <InvoiceForm formData={formData} onSubmit={handleSubmit} />
    </div>
  );
}
