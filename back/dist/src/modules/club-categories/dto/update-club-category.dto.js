"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateClubCategoryDto = void 0;
const mapped_types_1 = require("@nestjs/mapped-types");
const create_club_category_dto_1 = require("./create-club-category.dto");
class UpdateClubCategoryDto extends (0, mapped_types_1.PartialType)(create_club_category_dto_1.CreateClubCategoryDto) {
}
exports.UpdateClubCategoryDto = UpdateClubCategoryDto;
//# sourceMappingURL=update-club-category.dto.js.map