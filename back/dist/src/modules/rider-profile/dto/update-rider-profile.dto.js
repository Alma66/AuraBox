"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateRiderProfileDto = void 0;
const mapped_types_1 = require("@nestjs/mapped-types");
const create_rider_profile_dto_1 = require("./create-rider-profile.dto");
class UpdateRiderProfileDto extends (0, mapped_types_1.PartialType)(create_rider_profile_dto_1.CreateRiderProfileDto) {
}
exports.UpdateRiderProfileDto = UpdateRiderProfileDto;
//# sourceMappingURL=update-rider-profile.dto.js.map