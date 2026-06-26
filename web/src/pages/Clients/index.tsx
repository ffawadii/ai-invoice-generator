import { Link, useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { useGetQuery } from '../../hooks/useGetQuery';
import { useCreateMutation } from '../../hooks/useCreateMutation';
import { queryKeys, endpoints } from '../../endpoints';
import type { Client } from '../../shared';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ClientForm } from './Form';
import type { ClientFormData } from './constant';
import { Spinner } from '@/components/ui/spinner';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';

export function Clients() {
    const { data: clients, isLoading } = useGetQuery<Client[]>(queryKeys.clients, endpoints.clients);

    if (isLoading) {
        return <Spinner message="Loading clients..." />;
    }

    return (
        <div className="max-w-6xl mx-auto space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Clients</h1>
                    <p className="text-muted-foreground mt-1">Manage your clients and their details.</p>
                </div>
                <Link to="/clients/new">
                    <Button>
                        <Plus className="w-4 h-4 mr-2" /> Add Client
                    </Button>
                </Link>
            </div>

            <Card>
                <CardHeader className="px-6 py-4 border-b">
                    <CardTitle>All Clients</CardTitle>
                    <CardDescription>A list of clients you have added.</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="pl-6">Name</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Address</TableHead>
                                <TableHead className="pr-6">Added On</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {clients?.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={4} className="h-32 text-center text-muted-foreground">
                                        No clients yet. Use the Chat to add one!
                                    </TableCell>
                                </TableRow>
                            )}
                            {clients?.map((client: Client) => (
                                <TableRow key={client.id}>
                                    <TableCell className="pl-6 font-medium">{client.name}</TableCell>
                                    <TableCell>{client.email || '-'}</TableCell>
                                    <TableCell>{client.address || '-'}</TableCell>
                                    <TableCell className="pr-6">{new Date(client.createdAt).toLocaleDateString()}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}

export function NewClient() {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const createClient = useCreateMutation({
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.clients });
        }
    });

    const handleSubmit = async (data: ClientFormData) => {
        try {
            await createClient.mutateAsync({ url: endpoints.clients, data });
            navigate('/clients');
        } catch (error) {
            console.error('Failed to create client:', error);
            alert('Failed to create client. Please try again.');
        }
    };

    return <ClientForm onSubmit={handleSubmit} />;
}
