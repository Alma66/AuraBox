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
exports.PlatformRulesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
function sanitize(rule) {
    if (!rule)
        return rule;
    if (rule.publicationDate instanceof Date)
        rule.publicationDate = rule.publicationDate.toISOString();
    return rule;
}
let PlatformRulesService = class PlatformRulesService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(dto) {
        const created = await this.prisma.platform_Rules.create({
            data: {
                title: dto.title,
                content: dto.content,
                version: dto.version,
                publicationDate: dto.publicationDate ? new Date(dto.publicationDate) : new Date(),
                active: dto.active ?? true,
                ruleType: dto.ruleType,
            },
        });
        return sanitize(created);
    }
    async findAll() {
        const rules = await this.prisma.platform_Rules.findMany({ orderBy: { publicationDate: 'desc' } });
        return rules.map(sanitize);
    }
    async findActive() {
        const rules = await this.prisma.platform_Rules.findMany({
            where: { active: true },
            orderBy: { publicationDate: 'desc' },
        });
        return rules.map(sanitize);
    }
    async findOne(id) {
        const item = await this.prisma.platform_Rules.findUnique({ where: { id } });
        if (!item)
            throw new common_1.NotFoundException('Regla de plataforma no encontrada');
        return sanitize(item);
    }
    async update(id, dto) {
        const item = await this.prisma.platform_Rules.findUnique({ where: { id } });
        if (!item)
            throw new common_1.NotFoundException('Regla de plataforma no encontrada');
        const updated = await this.prisma.platform_Rules.update({
            where: { id },
            data: {
                ...dto,
                publicationDate: dto.publicationDate ? new Date(dto.publicationDate) : item.publicationDate,
            },
        });
        return sanitize(updated);
    }
    async remove(id) {
        const item = await this.prisma.platform_Rules.findUnique({ where: { id } });
        if (!item)
            throw new common_1.NotFoundException('Regla de plataforma no encontrada');
        await this.prisma.platform_Rules.delete({ where: { id } });
        return { message: 'Regla eliminada correctamente' };
    }
};
exports.PlatformRulesService = PlatformRulesService;
exports.PlatformRulesService = PlatformRulesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PlatformRulesService);
//# sourceMappingURL=platform-rules.service.js.map