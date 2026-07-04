import { ImageClubService } from './image-club.service';
import { CreateImageClubDto } from './dto/create-image-club.dto';
import { UpdateImageClubDto } from './dto/update-image-club.dto';
export declare class ImageClubController {
    private readonly imageClubService;
    constructor(imageClubService: ImageClubService);
    create(dto: CreateImageClubDto, req: any, image?: Express.Multer.File): Promise<any>;
    findAll(): Promise<any[]>;
    findByClub(idClub: number, section?: string): Promise<any[]>;
    findOne(id: number): Promise<any>;
    update(id: number, dto: UpdateImageClubDto): Promise<any>;
    removeMany(body: {
        ids: number[];
    }): Promise<{
        message: string;
    }>;
    remove(id: number): Promise<{
        message: string;
    }>;
}
