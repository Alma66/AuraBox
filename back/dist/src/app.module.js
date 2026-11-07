"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const jwt_1 = require("@nestjs/jwt");
const throttler_1 = require("@nestjs/throttler");
const common_2 = require("@nestjs/common");
const app_controller_1 = require("./app.controller");
const app_service_1 = require("./app.service");
const admin_panel_module_1 = require("./modules/admin-panel/admin-panel.module");
const config_1 = require("@nestjs/config");
const cloudinary_module_1 = require("./modules/cloudinary/cloudinary.module");
const prisma_module_1 = require("./prisma/prisma.module");
const newsletter_module_1 = require("./modules/newsletter/newsletter.module");
const user_category_preferences_module_1 = require("./modules/user-category-preferences/user-category-preferences.module");
const cart_item_module_1 = require("./modules/cart-item/cart-item.module");
const analytics_module_1 = require("./modules/analytics/analytics.module");
const admin_or_entrepreneur_role_module_1 = require("./modules/admin-or-entrepreneur-role/admin-or-entrepreneur-role.module");
const admins_module_1 = require("./modules/admins/admins.module");
const auth_module_1 = require("./modules/auth/auth.module");
const box_content_history_module_1 = require("./modules/box-content-history/box-content-history.module");
const club_billing_module_1 = require("./modules/club-billing/club-billing.module");
const billing_module_1 = require("./modules/billing/billing.module");
const categories_module_1 = require("./modules/categories/categories.module");
const club_categories_module_1 = require("./modules/club-categories/club-categories.module");
const club_payment_method_module_1 = require("./modules/club-payment-method/club-payment-method.module");
const club_social_networks_module_1 = require("./modules/club-social-networks/club-social-networks.module");
const club_status_history_module_1 = require("./modules/club-status-history/club-status-history.module");
const clubs_module_1 = require("./modules/clubs/clubs.module");
const entrepreneur_club_module_1 = require("./modules/entrepreneur-club/entrepreneur-club.module");
const entrepreneur_licenses_module_1 = require("./modules/entrepreneur-licenses/entrepreneur-licenses.module");
const entrpreneurs_module_1 = require("./modules/entrepreneurs/entrpreneurs.module");
const favorites_module_1 = require("./modules/favorites/favorites.module");
const image_club_module_1 = require("./modules/image-club/image-club.module");
const license_types_module_1 = require("./modules/license-types/license-types.module");
const payment_methods_module_1 = require("./modules/payment-methods/payment-methods.module");
const payments_module_1 = require("./modules/payments/payments.module");
const permissions_module_1 = require("./modules/permissions/permissions.module");
const platform_rules_module_1 = require("./modules/platform-rules/platform-rules.module");
const reviews_module_1 = require("./modules/reviews/reviews.module");
const rider_profile_module_1 = require("./modules/rider-profile/rider-profile.module");
const role_module_1 = require("./modules/role/role.module");
const role_permissions_module_1 = require("./modules/role-permissions/role-permissions.module");
const shipments_module_1 = require("./modules/shipments/shipments.module");
const subscription_types_module_1 = require("./modules/subscription-types/subscription-types.module");
const transaction_history_module_1 = require("./modules/transaction-history/transaction-history.module");
const user_club_preferences_module_1 = require("./modules/user-club-preferences/user-club-preferences.module");
const user_subscriptions_module_1 = require("./modules/user-subscriptions/user-subscriptions.module");
const users_module_1 = require("./modules/users/users.module");
const courier_module_1 = require("./modules/courier/courier.module");
const promotion_module_1 = require("./modules/promotion/promotion.module");
const support_module_1 = require("./modules/support/support.module");
const inventory_module_1 = require("./modules/inventory/inventory.module");
const finance_module_1 = require("./modules/finance/finance.module");
const club_legal_content_module_1 = require("./modules/club-legal-content/club-legal-content.module");
const jwt_auth_guard_1 = require("./common/guards/jwt-auth.guard");
const transform_interceptor_1 = require("./common/interceptors/transform.interceptor");
const all_exceptions_filter_1 = require("./common/filters/all-exceptions.filter");
const jwtSecret = process.env.JWT_SECRET;
if (!jwtSecret) {
    throw new Error('JWT_SECRET environment variable is required');
}
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            prisma_module_1.PrismaModule,
            config_1.ConfigModule.forRoot({ isGlobal: true }),
            cloudinary_module_1.CloudinaryModule,
            jwt_1.JwtModule.register({
                global: true,
                secret: jwtSecret,
                signOptions: { expiresIn: '2h' },
            }),
            throttler_1.ThrottlerModule.forRoot({
                throttlers: [{ ttl: 60000, limit: 30 }],
            }),
            analytics_module_1.AnalyticsModule,
            admin_or_entrepreneur_role_module_1.AdminOrEntrepreneurRoleModule,
            admin_panel_module_1.AdminPanelModule,
            admins_module_1.AdminsModule,
            auth_module_1.AuthModule,
            box_content_history_module_1.BoxContentHistoryModule,
            billing_module_1.BillingModule,
            club_billing_module_1.ClubBillingModule,
            categories_module_1.CategoriesModule,
            club_categories_module_1.ClubCategoriesModule,
            club_payment_method_module_1.ClubPaymentMethodModule,
            club_social_networks_module_1.ClubSocialNetworksModule,
            club_status_history_module_1.ClubStatusHistoryModule,
            clubs_module_1.ClubsModule,
            entrepreneur_club_module_1.EntrepreneurClubModule,
            entrepreneur_licenses_module_1.EntrepreneurLicensesModule,
            entrpreneurs_module_1.EntrepreneursModule,
            favorites_module_1.FavoritesModule,
            image_club_module_1.ImageClubModule,
            license_types_module_1.LicenseTypesModule,
            payment_methods_module_1.PaymentMethodsModule,
            payments_module_1.PaymentsModule,
            permissions_module_1.PermissionsModule,
            platform_rules_module_1.PlatformRulesModule,
            reviews_module_1.ReviewsModule,
            rider_profile_module_1.RiderProfileModule,
            role_module_1.RoleModule,
            role_permissions_module_1.RolePermissionsModule,
            shipments_module_1.ShipmentsModule,
            subscription_types_module_1.SubscriptionTypesModule,
            transaction_history_module_1.TransactionHistoryModule,
            user_club_preferences_module_1.UserClubPreferencesModule,
            user_subscriptions_module_1.UserSubscriptionsModule,
            users_module_1.UsersModule,
            courier_module_1.CourierModule,
            promotion_module_1.PromotionModule,
            support_module_1.SupportModule,
            inventory_module_1.InventoryModule,
            finance_module_1.FinanceModule,
            cart_item_module_1.CartItemModule,
            user_category_preferences_module_1.UserCategoryPreferencesModule,
            club_legal_content_module_1.ClubLegalContentModule,
            newsletter_module_1.NewsletterModule,
        ],
        controllers: [app_controller_1.AppController],
        providers: [
            app_service_1.AppService,
            core_1.Reflector,
            {
                provide: core_1.APP_GUARD,
                useClass: throttler_1.ThrottlerGuard,
            },
            {
                provide: core_1.APP_GUARD,
                useClass: jwt_auth_guard_1.JwtAuthGuard,
            },
            {
                provide: core_1.APP_PIPE,
                useFactory: () => new common_2.ValidationPipe({
                    whitelist: true,
                    forbidNonWhitelisted: true,
                    transform: true,
                }),
            },
            {
                provide: core_1.APP_INTERCEPTOR,
                useClass: transform_interceptor_1.TransformInterceptor,
            },
            {
                provide: core_1.APP_FILTER,
                useClass: all_exceptions_filter_1.AllExceptionsFilter,
            },
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map