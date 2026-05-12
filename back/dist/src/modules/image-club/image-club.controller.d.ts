import { ImageClubService } from './image-club.service';
import { CreateImageClubDto } from './dto/create-image-club.dto';
import { UpdateImageClubDto } from './dto/update-image-club.dto';
export declare class ImageClubController {
    private readonly imageClubService;
    constructor(imageClubService: ImageClubService);
    create(dto: CreateImageClubDto, req: any): Promise<any>;
    findAll(): Promise<any[]>;
    findByClub(idClub: number): Promise<any[]>;
    findOne(id: number): Promise<any>;
    update(id: number, dto: UpdateImageClubDto, req: any): Promise<any>;
    remove(id: number, req: any): Promise<{
        message: string;
    }>;
}
