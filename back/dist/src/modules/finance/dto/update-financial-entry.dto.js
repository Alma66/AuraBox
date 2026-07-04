"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateFinancialEntryDto = void 0;
const mapped_types_1 = require("@nestjs/mapped-types");
const create_financial_entry_dto_1 = require("./create-financial-entry.dto");
class UpdateFinancialEntryDto extends (0, mapped_types_1.PartialType)(create_financial_entry_dto_1.CreateFinancialEntryDto) {
}
exports.UpdateFinancialEntryDto = UpdateFinancialEntryDto;
//# sourceMappingURL=update-financial-entry.dto.js.map