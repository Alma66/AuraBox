"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateSupplyCategoryDto = void 0;
const mapped_types_1 = require("@nestjs/mapped-types");
const create_supply_category_dto_1 = require("./create-supply-category.dto");
class UpdateSupplyCategoryDto extends (0, mapped_types_1.PartialType)(create_supply_category_dto_1.CreateSupplyCategoryDto) {
}
exports.UpdateSupplyCategoryDto = UpdateSupplyCategoryDto;
//# sourceMappingURL=update-supply-category.dto.js.map