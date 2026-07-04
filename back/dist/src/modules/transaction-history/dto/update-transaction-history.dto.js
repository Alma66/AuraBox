"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateTransactionHistoryDto = void 0;
const mapped_types_1 = require("@nestjs/mapped-types");
const create_transaction_history_dto_1 = require("./create-transaction-history.dto");
class UpdateTransactionHistoryDto extends (0, mapped_types_1.PartialType)(create_transaction_history_dto_1.CreateTransactionHistoryDto) {
}
exports.UpdateTransactionHistoryDto = UpdateTransactionHistoryDto;
//# sourceMappingURL=update-transaction-history.dto.js.map