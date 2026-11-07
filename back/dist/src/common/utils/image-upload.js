"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.imageUploadOptions = exports.IMAGE_MAX_BYTES = void 0;
exports.hasValidImageSignature = hasValidImageSignature;
const common_1 = require("@nestjs/common");
const multer_1 = require("multer");
exports.IMAGE_MAX_BYTES = 8 * 1024 * 1024;
exports.imageUploadOptions = {
    storage: (0, multer_1.memoryStorage)(),
    limits: { fileSize: exports.IMAGE_MAX_BYTES },
    fileFilter: (_req, file, callback) => {
        if (!/^image\/(jpe?g|png|gif|webp)$/i.test(file.mimetype)) {
            callback(new common_1.BadRequestException('Solo se permiten imágenes JPG, PNG, GIF o WEBP'), false);
            return;
        }
        callback(null, true);
    },
};
function hasValidImageSignature(buffer) {
    if (!buffer || buffer.length < 12)
        return false;
    const isJpeg = buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;
    const isPng = buffer
        .subarray(0, 8)
        .equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]));
    const isGif = buffer.subarray(0, 4).toString('ascii') === 'GIF8';
    const isWebp = buffer.subarray(0, 4).toString('ascii') === 'RIFF' &&
        buffer.subarray(8, 12).toString('ascii') === 'WEBP';
    return isJpeg || isPng || isGif || isWebp;
}
//# sourceMappingURL=image-upload.js.map