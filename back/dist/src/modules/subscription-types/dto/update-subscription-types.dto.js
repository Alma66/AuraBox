"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateSubscriptionTypeDto = void 0;
const mapped_types_1 = require("@nestjs/mapped-types");
const create_subscription_types_dto_1 = require("./create-subscription-types.dto");
class UpdateSubscriptionTypeDto extends (0, mapped_types_1.PartialType)(create_subscription_types_dto_1.CreateSubscriptionTypeDto) {
}
exports.UpdateSubscriptionTypeDto = UpdateSubscriptionTypeDto;
//# sourceMappingURL=update-subscription-types.dto.js.map