"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateLicenseTypeDto = void 0;
const mapped_types_1 = require("@nestjs/mapped-types");
const create_license_type_dto_1 = require("./create-license-type.dto");
class UpdateLicenseTypeDto extends (0, mapped_types_1.PartialType)(create_license_type_dto_1.CreateLicenseTypeDto) {
}
exports.UpdateLicenseTypeDto = UpdateLicenseTypeDto;
//# sourceMappingURL=update-license-type.dto.js.map