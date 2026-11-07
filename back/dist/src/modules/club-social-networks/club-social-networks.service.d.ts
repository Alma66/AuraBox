import { PrismaService } from '../../prisma/prisma.service';
import { CreateClubSocialNetworkDto } from './dto/create-club-social-network.dto';
import { UpdateClubSocialNetworkDto } from './dto/update-club-social-network.dto';
type RequestUser = {
    id: number;
    role: string;
};
export declare class ClubSocialNetworksService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    private assertClubAccess;
    create(dto: CreateClubSocialNetworkDto, user: RequestUser): Promise<{
        id: number;
        idClub: number;
        networkType: string;
        profileUrl: string;
    }>;
    findAll(): Promise<{
        id: number;
        idClub: number;
        networkType: string;
        profileUrl: string;
    }[]>;
    findByClub(idClub: number): Promise<{
        id: number;
        idClub: number;
        networkType: string;
        profileUrl: string;
    }[]>;
    findOne(id: number): Promise<{
        id: number;
        idClub: number;
        networkType: string;
        profileUrl: string;
    }>;
    update(id: number, dto: UpdateClubSocialNetworkDto, user: RequestUser): Promise<{
        id: number;
        idClub: number;
        networkType: string;
        profileUrl: string;
    }>;
    remove(id: number, user: RequestUser): Promise<{
        message: string;
    }>;
}
export {};
