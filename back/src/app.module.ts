import { Module, ValidationPipe } from '@nestjs/common';
import { APP_GUARD, APP_PIPE, APP_INTERCEPTOR, APP_FILTER, Reflector } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import { AppController } from './app.controller';
import { AppService } from './app.service';

import { ConfigModule } from '@nestjs/config';
import { CloudinaryModule } from './modules/cloudinary/cloudinary.module';
import { PrismaModule } from './prisma/prisma.module';

import { AnalyticsModule } from './modules/analytics/analytics.module';
import { AdminOrEntrepreneurRoleModule } from './modules/admin-or-entrepreneur-role/admin-or-entrepreneur-role.module';
import { AdminsModule } from './modules/admins/admins.module';
import { AuthModule } from './modules/auth/auth.module';
import { BoxContentHistoryModule } from './modules/box-content-history/box-content-history.module';
import { CategoriesModule } from './modules/categories/categories.module';
import { ClubCategoriesModule } from './modules/club-categories/club-categories.module';
import { ClubPaymentMethodModule } from './modules/club-payment-method/club-payment-method.module';
import { ClubSocialNetworksModule } from './modules/club-social-networks/club-social-networks.module';
import { ClubStatusHistoryModule } from './modules/club-status-history/club-status-history.module';
import { ClubsModule } from './modules/clubs/clubs.module';
import { EntrepreneurClubModule } from './modules/entrepreneur-club/entrepreneur-club.module';
import { EntrepreneurLicensesModule } from './modules/entrepreneur-licenses/entrepreneur-licenses.module';
import { EntrepreneursModule } from './modules/entrepreneurs/entrpreneurs.module';
import { FavoritesModule } from './modules/favorites/favorites.module';
import { ImageClubModule } from './modules/image-club/image-club.module';
import { LicenseTypesModule } from './modules/license-types/license-types.module';
import { PaymentMethodsModule } from './modules/payment-methods/payment-methods.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { PermissionsModule } from './modules/permissions/permissions.module';
import { PlatformRulesModule } from './modules/platform-rules/platform-rules.module';
import { ReviewsModule } from './modules/reviews/reviews.module';
import { RiderProfileModule } from './modules/rider-profile/rider-profile.module';
import { RoleModule } from './modules/role/role.module';
import { RolePermissionsModule } from './modules/role-permissions/role-permissions.module';
import { ShipmentsModule } from './modules/shipments/shipments.module';
import { SubscriptionTypesModule } from './modules/subscription-types/subscription-types.module';
import { TransactionHistoryModule } from './modules/transaction-history/transaction-history.module';
import { UserClubPreferencesModule } from './modules/user-club-preferences/user-club-preferences.module';
import { UserSubscriptionsModule } from './modules/user-subscriptions/user-subscriptions.module';
import { UsersModule } from './modules/users/users.module';
import { CourierModule } from './modules/courier/courier.module';
import { PromotionModule } from './modules/promotion/promotion.module';
import { SupportModule } from './modules/support/support.module';

import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';

@Module({
  imports: [
    PrismaModule,
    ConfigModule.forRoot({ isGlobal: true }),
    CloudinaryModule,
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET || 'superSecretDevKey',
      signOptions: { expiresIn: '7d' },
    }),

    AnalyticsModule,
    AdminOrEntrepreneurRoleModule,
    AdminsModule,
    AuthModule,
    BoxContentHistoryModule,
    CategoriesModule,
    ClubCategoriesModule,
    ClubPaymentMethodModule,
    ClubSocialNetworksModule,
    ClubStatusHistoryModule,
    ClubsModule,
    EntrepreneurClubModule,
    EntrepreneurLicensesModule,
    EntrepreneursModule,
    FavoritesModule,
    ImageClubModule,
    LicenseTypesModule,
    PaymentMethodsModule,
    PaymentsModule,
    PermissionsModule,
    PlatformRulesModule,
    ReviewsModule,
    RiderProfileModule,
    RoleModule,
    RolePermissionsModule,
    ShipmentsModule,
    SubscriptionTypesModule,
    TransactionHistoryModule,
    UserClubPreferencesModule,
    UserSubscriptionsModule,
    UsersModule,
    CourierModule,
    PromotionModule,
    SupportModule,
  ],
  controllers: [AppController],

  providers: [
    AppService,
    Reflector,

    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },

    {
      provide: APP_PIPE,
      useFactory: () =>
        new ValidationPipe({
          whitelist: true,
          forbidNonWhitelisted: true,
          transform: true,
        }),
    },

    {
      provide: APP_INTERCEPTOR,
      useClass: TransformInterceptor,
    },

    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
  ],
})
export class AppModule {}