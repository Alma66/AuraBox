"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateImageClubDto = void 0;
const mapped_types_1 = require("@nestjs/mapped-types");
const create_image_club_dto_1 = require("./create-image-club.dto");
class UpdateImageClubDto extends (0, mapped_types_1.PartialType)(create_image_club_dto_1.CreateImageClubDto) {
}
exports.UpdateImageClubDto = UpdateImageClubDto;
//# sourceMappingURL=update-image-club.dto.js.map