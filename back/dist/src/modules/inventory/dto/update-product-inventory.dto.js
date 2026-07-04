"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateProductInventoryDto = void 0;
const mapped_types_1 = require("@nestjs/mapped-types");
const create_product_inventory_dto_1 = require("./create-product-inventory.dto");
class UpdateProductInventoryDto extends (0, mapped_types_1.PartialType)(create_product_inventory_dto_1.CreateProductInventoryDto) {
}
exports.UpdateProductInventoryDto = UpdateProductInventoryDto;
//# sourceMappingURL=update-product-inventory.dto.js.map