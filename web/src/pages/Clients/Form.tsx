import { useForm } from 'react-hook-form';

import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Field, FieldLabel, FieldError } from '@/components/ui/field';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { defaultClientValues, clientSchema, type ClientFormData } from './constant';

interface IClientForm {
  title?: string;
  formData?: Partial<ClientFormData>;
  onSubmit: (data: ClientFormData) => void;
}

export function ClientForm({ title = "Add New Client", formData, onSubmit }: IClientForm) {
  const { register, handleSubmit: hookSubmit, formState: { errors } } = useForm<ClientFormData>({
    resolver: zodResolver(clientSchema),
    defaultValues: formData || defaultClientValues
  });

  return (
    <div className="pb-12">
      <div className="max-w-xl mx-auto mb-4 px-4 md:px-0">
        <h1 className="text-2xl font-bold text-slate-800">{title}</h1>
      </div>
      <Card className="max-w-xl mx-auto border-none shadow-none md:border md:shadow-sm">
        <CardContent className="p-6 md:p-12">
          <div className="space-y-6">
          <Field>
            <FieldLabel htmlFor="name">Client Name</FieldLabel>
            <Input id="name" {...register('name')} placeholder="Acme Corp" />
            <FieldError errors={[errors.name]} />
          </Field>

          <Field>
            <FieldLabel htmlFor="email">Email (Optional)</FieldLabel>
            <Input id="email" type="email" {...register('email')} placeholder="billing@acmecorp.com" />
            <FieldError errors={[errors.email]} />
          </Field>

          <Field>
            <FieldLabel htmlFor="address">Address (Optional)</FieldLabel>
            <Textarea id="address" {...register('address')} placeholder="123 Business Rd&#10;Suite 100&#10;City, State 12345" className="h-24 resize-none" />
          </Field>

          <Button type="button" onClick={hookSubmit(onSubmit)} className="w-full mt-4">Save Client</Button>
        </div>
      </CardContent>
    </Card>
    </div>
  );
}




