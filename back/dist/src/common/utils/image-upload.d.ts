export declare const IMAGE_MAX_BYTES: number;
export declare const imageUploadOptions: {
    storage: import("multer").StorageEngine;
    limits: {
        fileSize: number;
    };
    fileFilter: (_req: unknown, file: {
        mimetype: string;
    }, callback: (error: Error | null, acceptFile: boolean) => void) => void;
};
export declare function hasValidImageSignature(buffer?: Buffer): boolean;
