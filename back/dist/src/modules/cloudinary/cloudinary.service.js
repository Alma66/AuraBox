"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CloudinaryService = void 0;
const common_1 = require("@nestjs/common");
const cloudinary_1 = require("cloudinary");
const image_upload_1 = require("../../common/utils/image-upload");
function ensureConfigured() {
    const cfg = cloudinary_1.v2.config();
    if (!cfg.api_key) {
        cloudinary_1.v2.config({
            cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
            api_key: process.env.CLOUDINARY_API_KEY,
            api_secret: process.env.CLOUDINARY_API_SECRET,
        });
    }
}
let CloudinaryService = class CloudinaryService {
    async uploadImage(file, folder = 'aurabox') {
        if (!file?.buffer || !(0, image_upload_1.hasValidImageSignature)(file.buffer)) {
            throw new common_1.BadRequestException('El archivo no es una imagen válida');
        }
        ensureConfigured();
        return new Promise((resolve, reject) => {
            const uploadStream = cloudinary_1.v2.uploader.upload_stream({
                folder,
                resource_type: 'image',
                transformation: [{ width: 1200, crop: 'limit' }, { quality: 'auto' }],
            }, (error, result) => {
                if (error)
                    reject(error);
                else
                    resolve(result.secure_url);
            });
            uploadStream.end(file.buffer);
        });
    }
    async uploadVideo(file, folder = 'aurabox') {
        ensureConfigured();
        return new Promise((resolve, reject) => {
            const uploadStream = cloudinary_1.v2.uploader.upload_stream({
                folder,
                resource_type: 'video',
                transformation: [{ quality: 'auto' }],
            }, (error, result) => {
                if (error)
                    reject(error);
                else
                    resolve(result.secure_url);
            });
            uploadStream.end(file.buffer);
        });
    }
    async deleteImage(publicId, resourceType = 'image') {
        if (!publicId)
            return;
        ensureConfigured();
        await cloudinary_1.v2.uploader.destroy(publicId, { resource_type: resourceType });
    }
    extractPublicId(url) {
        const clean = (url || '').split('?')[0];
        const marker = '/upload/';
        const index = clean.indexOf(marker);
        if (index === -1)
            return '';
        return clean
            .slice(index + marker.length)
            .replace(/^v\d+\//, '')
            .replace(/\.[^./]+$/, '');
    }
    async uploadDocument(file, folder = 'aurabox') {
        ensureConfigured();
        return new Promise((resolve, reject) => {
            const uploadStream = cloudinary_1.v2.uploader.upload_stream({ folder, resource_type: 'raw' }, (error, result) => {
                if (error)
                    reject(error);
                else
                    resolve(result.secure_url);
            });
            uploadStream.end(file.buffer);
        });
    }
};
exports.CloudinaryService = CloudinaryService;
exports.CloudinaryService = CloudinaryService = __decorate([
    (0, common_1.Injectable)()
], CloudinaryService);
//# sourceMappingURL=cloudinary.service.js.map