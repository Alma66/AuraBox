import { ClubSocialNetworksService } from './club-social-networks.service';
import { CreateClubSocialNetworkDto } from './dto/create-club-social-network.dto';
import { UpdateClubSocialNetworkDto } from './dto/update-club-social-network.dto';
export declare class ClubSocialNetworksController {
    private readonly svc;
    constructor(svc: ClubSocialNetworksService);
    create(dto: CreateClubSocialNetworkDto, req: any): Promise<{
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
    update(id: number, dto: UpdateClubSocialNetworkDto): Promise<{
        id: number;
        idClub: number;
        networkType: string;
        profileUrl: string;
    }>;
    remove(id: number): Promise<{
        message: string;
    }>;
}
