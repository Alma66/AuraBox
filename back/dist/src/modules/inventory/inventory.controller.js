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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.InventoryController = void 0;
const common_1 = require("@nestjs/common");
const inventory_service_1 = require("./inventory.service");
const create_supply_category_dto_1 = require("./dto/create-supply-category.dto");
const update_supply_category_dto_1 = require("./dto/update-supply-category.dto");
const create_supplier_dto_1 = require("./dto/create-supplier.dto");
const update_supplier_dto_1 = require("./dto/update-supplier.dto");
const create_product_inventory_dto_1 = require("./dto/create-product-inventory.dto");
const update_product_inventory_dto_1 = require("./dto/update-product-inventory.dto");
const create_supply_order_dto_1 = require("./dto/create-supply-order.dto");
const update_supply_order_dto_1 = require("./dto/update-supply-order.dto");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const roles_guard_1 = require("../auth/roles.guard");
const roles_decorator_1 = require("../auth/roles.decorator");
let InventoryController = class InventoryController {
    svc;
    constructor(svc) {
        this.svc = svc;
    }
    async createCategory(dto) {
        return this.svc.createCategory(dto);
    }
    async findCategories(idClub) {
        return this.svc.findCategoriesByClub(idClub);
    }
    async updateCategory(id, dto) {
        return this.svc.updateCategory(id, dto);
    }
    async removeCategory(id) {
        return this.svc.removeCategory(id);
    }
    async createSupplier(dto) {
        return this.svc.createSupplier(dto);
    }
    async findSuppliers(idClub) {
        return this.svc.findSuppliersByClub(idClub);
    }
    async updateSupplier(id, dto) {
        return this.svc.updateSupplier(id, dto);
    }
    async removeSupplier(id) {
        return this.svc.removeSupplier(id);
    }
    async createProduct(dto) {
        return this.svc.createProduct(dto);
    }
    async findProducts(idClub) {
        return this.svc.findProductsByClub(idClub);
    }
    async updateProduct(id, dto) {
        return this.svc.updateProduct(id, dto);
    }
    async removeProduct(id) {
        return this.svc.removeProduct(id);
    }
    async createOrder(dto) {
        return this.svc.createOrder(dto);
    }
    async findOrders(idClub) {
        return this.svc.findOrdersByClub(idClub);
    }
    async updateOrder(id, dto) {
        return this.svc.updateOrder(id, dto);
    }
    async removeOrder(id) {
        return this.svc.removeOrder(id);
    }
};
exports.InventoryController = InventoryController;
__decorate([
    (0, common_1.Post)('categories'),
    (0, common_1.UsePipes)(new common_1.ValidationPipe({ whitelist: true, transform: true })),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_supply_category_dto_1.CreateSupplyCategoryDto]),
    __metadata("design:returntype", Promise)
], InventoryController.prototype, "createCategory", null);
__decorate([
    (0, common_1.Get)('categories/by-club/:idClub'),
    __param(0, (0, common_1.Param)('idClub', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], InventoryController.prototype, "findCategories", null);
__decorate([
    (0, common_1.Put)('categories/:id'),
    (0, common_1.UsePipes)(new common_1.ValidationPipe({ whitelist: true, transform: true })),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, update_supply_category_dto_1.UpdateSupplyCategoryDto]),
    __metadata("design:returntype", Promise)
], InventoryController.prototype, "updateCategory", null);
__decorate([
    (0, common_1.Delete)('categories/:id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], InventoryController.prototype, "removeCategory", null);
__decorate([
    (0, common_1.Post)('suppliers'),
    (0, common_1.UsePipes)(new common_1.ValidationPipe({ whitelist: true, transform: true })),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_supplier_dto_1.CreateSupplierDto]),
    __metadata("design:returntype", Promise)
], InventoryController.prototype, "createSupplier", null);
__decorate([
    (0, common_1.Get)('suppliers/by-club/:idClub'),
    __param(0, (0, common_1.Param)('idClub', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], InventoryController.prototype, "findSuppliers", null);
__decorate([
    (0, common_1.Put)('suppliers/:id'),
    (0, common_1.UsePipes)(new common_1.ValidationPipe({ whitelist: true, transform: true })),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, update_supplier_dto_1.UpdateSupplierDto]),
    __metadata("design:returntype", Promise)
], InventoryController.prototype, "updateSupplier", null);
__decorate([
    (0, common_1.Delete)('suppliers/:id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], InventoryController.prototype, "removeSupplier", null);
__decorate([
    (0, common_1.Post)('products'),
    (0, common_1.UsePipes)(new common_1.ValidationPipe({ whitelist: true, transform: true })),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_product_inventory_dto_1.CreateProductInventoryDto]),
    __metadata("design:returntype", Promise)
], InventoryController.prototype, "createProduct", null);
__decorate([
    (0, common_1.Get)('products/by-club/:idClub'),
    __param(0, (0, common_1.Param)('idClub', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], InventoryController.prototype, "findProducts", null);
__decorate([
    (0, common_1.Put)('products/:id'),
    (0, common_1.UsePipes)(new common_1.ValidationPipe({ whitelist: true, transform: true })),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, update_product_inventory_dto_1.UpdateProductInventoryDto]),
    __metadata("design:returntype", Promise)
], InventoryController.prototype, "updateProduct", null);
__decorate([
    (0, common_1.Delete)('products/:id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], InventoryController.prototype, "removeProduct", null);
__decorate([
    (0, common_1.Post)('orders'),
    (0, common_1.UsePipes)(new common_1.ValidationPipe({ whitelist: true, transform: true })),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_supply_order_dto_1.CreateSupplyOrderDto]),
    __metadata("design:returntype", Promise)
], InventoryController.prototype, "createOrder", null);
__decorate([
    (0, common_1.Get)('orders/by-club/:idClub'),
    __param(0, (0, common_1.Param)('idClub', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], InventoryController.prototype, "findOrders", null);
__decorate([
    (0, common_1.Put)('orders/:id'),
    (0, common_1.UsePipes)(new common_1.ValidationPipe({ whitelist: true, transform: true })),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, update_supply_order_dto_1.UpdateSupplyOrderDto]),
    __metadata("design:returntype", Promise)
], InventoryController.prototype, "updateOrder", null);
__decorate([
    (0, common_1.Delete)('orders/:id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], InventoryController.prototype, "removeOrder", null);
exports.InventoryController = InventoryController = __decorate([
    (0, common_1.Controller)('inventory'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('entrepreneur', 'admin'),
    __metadata("design:paramtypes", [inventory_service_1.InventoryService])
], InventoryController);
//# sourceMappingURL=inventory.controller.js.map