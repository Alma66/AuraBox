import { PrismaService } from '../../prisma/prisma.service';
import { CreateClubDto } from './dto/create-club.dto';
import { UpdateClubDto } from './dto/update-club.dto';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { Prisma } from '@prisma/client';
interface FindAllFilters {
    search?: string;
    categoryIds?: number[];
    minRating?: number;
    minReviews?: number;
}
export declare class ClubsService {
    private readonly prisma;
    private readonly cloudinaryService;
    constructor(prisma: PrismaService, cloudinaryService: CloudinaryService);
    private readonly categoryAffinity;
    create(dto: CreateClubDto): Promise<{
        id: number;
        name: string;
        logoUrl: string;
        slogan: string | null;
        history: string | null;
        shortDescription: string;
        contactEmail: string;
        whatsappContact: string | null;
        clubStatus: import("@prisma/client").$Enums.ClubStatus;
        creationDate: Date;
        averageRating: Prisma.Decimal | null;
        totalReviews: number;
        communityText: string | null;
        milestones: string | null;
        shippingWindowStartDay: number | null;
        shippingWindowEndDay: number | null;
        bankHolder: string | null;
        bankCbu: string | null;
        bankAlias: string | null;
    }>;
    findAll(filters?: FindAllFilters): Promise<any[]>;
    private attachCategories;
    findFeatured(): Promise<any[]>;
    getRecommendationsForUser(userId: number): Promise<any[]>;
    findOne(id: number, requester?: number | {
        id: number;
        role: string;
    }): Promise<any>;
    update(id: number, dto: UpdateClubDto, user: {
        id: number;
        role: string;
    }): Promise<any>;
    updateLogo(id: number, file: Express.Multer.File, entrepreneurId: number): Promise<any>;
    remove(id: number): Promise<{
        ok: boolean;
    }>;
    findSubscriptionsByClub(clubId: number, entrepreneurId: number): Promise<any[]>;
    findCustomersByClub(clubId: number, entrepreneurId: number): Promise<{
        id: number;
        firstName: string;
        lastName: string;
        email: string;
        active: boolean;
        registrationDate: string;
        phoneNumber: string | null;
        streetAddress: string | null;
        addressNumber: number | null;
        floorNumber: string | null;
        addressDetails: string | null;
        city: string | null;
        province: string | null;
        postalCode: string | null;
    }[]>;
    findClubByEntrepreneur(entrepreneurId: number): Promise<any>;
    assertOwnership(clubId: number, entrepreneurId: number): Promise<{
        id: number;
        idEntrepreneurs: number;
        idClub: number;
        associationDate: Date;
    }>;
    private mapPlan;
    private sanitizeClub;
    private sanitizeSubscription;
}
export {};
