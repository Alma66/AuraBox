"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserCategoryPreferencesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
let UserCategoryPreferencesService = class UserCategoryPreferencesService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findByUser(idUser) {
        const prefs = await this.prisma.user_Category_Preference.findMany({ where: { idUser } });
        const categoryIds = prefs.map((p) => p.idCategory);
        if (categoryIds.length === 0)
            return [];
        return this.prisma.categories.findMany({ where: { id: { in: categoryIds } } });
    }
    async replace(idUser, categoryIds) {
        const uniqueIds = Array.from(new Set(categoryIds));
        if (uniqueIds.length > 0) {
            const found = await this.prisma.categories.findMany({ where: { id: { in: uniqueIds } } });
            if (found.length !== uniqueIds.length) {
                throw new common_1.BadRequestException('Alguna categoría no existe');
            }
        }
        await this.prisma.user_Category_Preference.deleteMany({ where: { idUser } });
        if (uniqueIds.length > 0) {
            await this.prisma.user_Category_Preference.createMany({
                data: uniqueIds.map((idCategory) => ({ idUser, idCategory })),
            });
        }
        return this.findByUser(idUser);
    }
};
exports.UserCategoryPreferencesService = UserCategoryPreferencesService;
exports.UserCategoryPreferencesService = UserCategoryPreferencesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], UserCategoryPreferencesService);
//# sourceMappingURL=user-category-preferences.service.js.map