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
exports.CartItemController = void 0;
const common_1 = require("@nestjs/common");
const cart_item_service_1 = require("./cart-item.service");
const create_cart_item_dto_1 = require("./dto/create-cart-item.dto");
const checkout_cart_dto_1 = require("./dto/checkout-cart.dto");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const roles_guard_1 = require("../auth/roles.guard");
const roles_decorator_1 = require("../auth/roles.decorator");
let CartItemController = class CartItemController {
    cartItemService;
    constructor(cartItemService) {
        this.cartItemService = cartItemService;
    }
    async addToCart(dto, req) {
        return this.cartItemService.addToCart(req.user.id, dto);
    }
    async findMine(req) {
        return this.cartItemService.findByUserEnriched(req.user.id);
    }
    async paymentOptions(req) {
        return this.cartItemService.getPaymentOptions(req.user.id);
    }
    async checkout(dto, req) {
        return this.cartItemService.checkout(req.user.id, dto);
    }
    async shippingOptions(req) {
        return this.cartItemService.getShippingOptions(req.user.id);
    }
    async remove(idSubscriptionTypes, req) {
        return this.cartItemService.remove(req.user.id, idSubscriptionTypes);
    }
    async clear(req) {
        return this.cartItemService.clear(req.user.id);
    }
};
exports.CartItemController = CartItemController;
__decorate([
    (0, common_1.Post)(),
    (0, common_1.UsePipes)(new common_1.ValidationPipe({ whitelist: true, transform: true })),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_cart_item_dto_1.CreateCartItemDto, Object]),
    __metadata("design:returntype", Promise)
], CartItemController.prototype, "addToCart", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], CartItemController.prototype, "findMine", null);
__decorate([
    (0, common_1.Get)('payment-options'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], CartItemController.prototype, "paymentOptions", null);
__decorate([
    (0, common_1.Post)('checkout'),
    (0, common_1.UsePipes)(new common_1.ValidationPipe({ whitelist: true, transform: true })),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [checkout_cart_dto_1.CheckoutCartDto, Object]),
    __metadata("design:returntype", Promise)
], CartItemController.prototype, "checkout", null);
__decorate([
    (0, common_1.Get)('shipping-options'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], CartItemController.prototype, "shippingOptions", null);
__decorate([
    (0, common_1.Delete)(':idSubscriptionTypes'),
    __param(0, (0, common_1.Param)('idSubscriptionTypes', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], CartItemController.prototype, "remove", null);
__decorate([
    (0, common_1.Delete)(),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], CartItemController.prototype, "clear", null);
exports.CartItemController = CartItemController = __decorate([
    (0, common_1.Controller)('cart-items'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('customer'),
    __metadata("design:paramtypes", [cart_item_service_1.CartItemService])
], CartItemController);
//# sourceMappingURL=cart-item.controller.js.map