export declare class CloudinaryService {
    uploadImage(file: Express.Multer.File, folder?: string): Promise<string>;
    uploadVideo(file: Express.Multer.File, folder?: string): Promise<string>;
    deleteImage(publicId: string, resourceType?: 'image' | 'video' | 'raw'): Promise<void>;
    extractPublicId(url: string): string;
    uploadDocument(file: Express.Multer.File, folder?: string): Promise<string>;
}
