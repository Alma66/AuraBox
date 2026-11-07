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
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../../prisma/prisma.service");
function sanitize(rule) {
    if (!rule)
        return rule;
    if (rule.publicationDate instanceof Date)
        rule.publicationDate = rule.publicationDate.toISOString();
    return rule;
}
function publicShape(rule) {
    return sanitize({
        id: rule.id,
        title: rule.title,
        content: rule.content,
        version: rule.version,
        ruleType: rule.ruleType,
        acceptanceScope: rule.acceptanceScope,
        publicationDate: rule.publicationDate,
    });
}
let PlatformRulesService = class PlatformRulesService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async assertVersionFree(ruleType, version, excludeId) {
        const duplicate = await this.prisma.platform_Rules.findFirst({
            where: { ruleType, version, ...(excludeId ? { id: { not: excludeId } } : {}) },
            select: { id: true },
        });
        if (duplicate) {
            throw new common_1.BadRequestException(`Ya existe la versión ${version} para este tipo de regla`);
        }
    }
    async create(dto) {
        const ruleType = dto.ruleType.trim();
        const version = dto.version.trim();
        await this.assertVersionFree(ruleType, version);
        const created = await this.prisma.platform_Rules.create({
            data: {
                title: dto.title.trim(),
                content: dto.content.trim(),
                version,
                ruleType,
                acceptanceScope: dto.acceptanceScope ?? client_1.RuleAcceptanceScope.NINGUNO,
                active: false,
                publicationDate: new Date(),
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
            orderBy: { ruleType: 'asc' },
        });
        return rules.map(publicShape);
    }
    async findRequiredForSignup(audience) {
        if (audience !== 'customer' && audience !== 'entrepreneur') {
            throw new common_1.BadRequestException('Tipo de cuenta inválido');
        }
        const scopes = [
            client_1.RuleAcceptanceScope.TODOS,
            audience === 'customer' ? client_1.RuleAcceptanceScope.CLIENTES : client_1.RuleAcceptanceScope.EMPRENDEDORES,
        ];
        const rules = await this.prisma.platform_Rules.findMany({
            where: { active: true, acceptanceScope: { in: scopes } },
            orderBy: { ruleType: 'asc' },
        });
        return rules.map(publicShape);
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
        if (item.active) {
            throw new common_1.BadRequestException('Una regla publicada no se puede editar. Creá una nueva versión.');
        }
        const ruleType = dto.ruleType !== undefined ? dto.ruleType.trim() : item.ruleType;
        const version = dto.version !== undefined ? dto.version.trim() : item.version;
        if (ruleType !== item.ruleType || version !== item.version) {
            await this.assertVersionFree(ruleType, version, id);
        }
        const updated = await this.prisma.platform_Rules.update({
            where: { id },
            data: {
                ruleType,
                version,
                ...(dto.title !== undefined ? { title: dto.title.trim() } : {}),
                ...(dto.content !== undefined ? { content: dto.content.trim() } : {}),
                ...(dto.acceptanceScope !== undefined ? { acceptanceScope: dto.acceptanceScope } : {}),
            },
        });
        return sanitize(updated);
    }
    async setActive(id, active) {
        const item = await this.prisma.platform_Rules.findUnique({ where: { id } });
        if (!item)
            throw new common_1.NotFoundException('Regla de plataforma no encontrada');
        if (item.active === active)
            return sanitize(item);
        if (!active) {
            const updated = await this.prisma.platform_Rules.update({ where: { id }, data: { active: false } });
            return sanitize(updated);
        }
        const [, published] = await this.prisma.$transaction([
            this.prisma.platform_Rules.updateMany({
                where: { ruleType: item.ruleType, active: true, id: { not: id } },
                data: { active: false },
            }),
            this.prisma.platform_Rules.update({
                where: { id },
                data: { active: true, publicationDate: new Date() },
            }),
        ]);
        return sanitize(published);
    }
    async remove(id) {
        const item = await this.prisma.platform_Rules.findUnique({ where: { id } });
        if (!item)
            throw new common_1.NotFoundException('Regla de plataforma no encontrada');
        if (item.active) {
            throw new common_1.BadRequestException('No se puede eliminar una regla publicada. Despublicala primero.');
        }
        const accepted = await this.prisma.terms_Acceptance.count({ where: { idPlatformRule: id } });
        if (accepted > 0) {
            throw new common_1.BadRequestException('Esta versión ya fue aceptada por usuarios y se conserva como historial');
        }
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