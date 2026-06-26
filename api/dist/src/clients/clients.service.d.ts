import { PrismaService } from '../prisma/prisma.service';
import { CreateClientDto, UpdateClientDto } from './dto/client.dto';
export declare class ClientsService {
    private prisma;
    constructor(prisma: PrismaService);
    create(userId: string, dto: CreateClientDto): Promise<{
        email: string | null;
        name: string;
        id: string;
        createdAt: Date;
        address: string | null;
        userId: string;
    }>;
    findAll(userId: string): Promise<{
        email: string | null;
        name: string;
        id: string;
        createdAt: Date;
        address: string | null;
        userId: string;
    }[]>;
    findOne(userId: string, id: string): Promise<{
        email: string | null;
        name: string;
        id: string;
        createdAt: Date;
        address: string | null;
        userId: string;
    }>;
    update(userId: string, id: string, dto: UpdateClientDto): Promise<{
        email: string | null;
        name: string;
        id: string;
        createdAt: Date;
        address: string | null;
        userId: string;
    }>;
    remove(userId: string, id: string): Promise<{
        email: string | null;
        name: string;
        id: string;
        createdAt: Date;
        address: string | null;
        userId: string;
    }>;
}
