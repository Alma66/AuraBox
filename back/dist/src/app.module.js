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
const app_controller_1 = require("./app.controller");
const app_service_1 = require("./app.service");
const prisma_module_1 = require("./prisma/prisma.module");
const admin_or_entrepreneur_role_module_1 = require("./modules/admin-or-entrepreneur-role/admin-or-entrepreneur-role.module");
const admins_module_1 = require("./modules/admins/admins.module");
const auth_module_1 = require("./modules/auth/auth.module");
const box_content_history_module_1 = require("./modules/box-content-history/box-content-history.module");
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
const role_module_1 = require("./modules/role/role.module");
const role_permissions_module_1 = require("./modules/role-permissions/role-permissions.module");
const shipments_module_1 = require("./modules/shipments/shipments.module");
const subscription_types_module_1 = require("./modules/subscription-types/subscription-types.module");
const transaction_history_module_1 = require("./modules/transaction-history/transaction-history.module");
const user_club_preferences_module_1 = require("./modules/user-club-preferences/user-club-preferences.module");
const user_subscriptions_module_1 = require("./modules/user-subscriptions/user-subscriptions.module");
const users_module_1 = require("./modules/users/users.module");
const jwt_auth_guard_1 = require("./common/guards/jwt-auth.guard");
const transform_interceptor_1 = require("./common/interceptors/transform.interceptor");
const all_exceptions_filter_1 = require("./common/filters/all-exceptions.filter");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            prisma_module_1.PrismaModule,
            jwt_1.JwtModule.register({
                global: true,
                secret: process.env.JWT_SECRET || 'superSecretDevKey',
                signOptions: { expiresIn: '7d' },
            }),
            admin_or_entrepreneur_role_module_1.AdminOrEntrepreneurRoleModule,
            admins_module_1.AdminsModule,
            auth_module_1.AuthModule,
            box_content_history_module_1.BoxContentHistoryModule,
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
            role_module_1.RoleModule,
            role_permissions_module_1.RolePermissionsModule,
            shipments_module_1.ShipmentsModule,
            subscription_types_module_1.SubscriptionTypesModule,
            transaction_history_module_1.TransactionHistoryModule,
            user_club_preferences_module_1.UserClubPreferencesModule,
            user_subscriptions_module_1.UserSubscriptionsModule,
            users_module_1.UsersModule,
        ],
        controllers: [app_controller_1.AppController],
        providers: [
            app_service_1.AppService,
            core_1.Reflector,
            {
                provide: core_1.APP_GUARD,
                useClass: jwt_auth_guard_1.JwtAuthGuard,
            },
            {
                provide: core_1.APP_PIPE,
                useFactory: () => new common_1.ValidationPipe({
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