import { ClientsService } from './clients.service';
import { CreateClientDto, UpdateClientDto } from './dto/client.dto';
export declare class ClientsController {
    private readonly clientsService;
    constructor(clientsService: ClientsService);
    create(user: any, createClientDto: CreateClientDto): Promise<{
        email: string | null;
        name: string;
        id: string;
        createdAt: Date;
        address: string | null;
        userId: string;
    }>;
    findAll(user: any): Promise<{
        email: string | null;
        name: string;
        id: string;
        createdAt: Date;
        address: string | null;
        userId: string;
    }[]>;
    findOne(user: any, id: string): Promise<{
        email: string | null;
        name: string;
        id: string;
        createdAt: Date;
        address: string | null;
        userId: string;
    }>;
    update(user: any, id: string, updateClientDto: UpdateClientDto): Promise<{
        email: string | null;
        name: string;
        id: string;
        createdAt: Date;
        address: string | null;
        userId: string;
    }>;
    remove(user: any, id: string): Promise<{
        email: string | null;
        name: string;
        id: string;
        createdAt: Date;
        address: string | null;
        userId: string;
    }>;
}
