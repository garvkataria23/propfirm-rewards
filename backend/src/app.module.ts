import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { StorageModule } from './modules/storage/storage.module';
import { EmailModule } from './modules/email/email.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { PropFirmsModule } from './modules/prop-firms/prop-firms.module';
import { PurchasesModule } from './modules/purchases/purchases.module';
import { PointsModule } from './modules/points/points.module';
import { RewardsModule } from './modules/rewards/rewards.module';
import { RedemptionsModule } from './modules/redemptions/redemptions.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { AdminModule } from './modules/admin/admin.module';
import { SupportModule } from './modules/support/support.module';
import { WhatsAppModule } from './modules/whatsapp/whatsapp.module';
import { WebhooksModule } from './modules/webhooks/webhooks.module';
import { AppController } from './app.controller';

@Module({
  controllers: [AppController],
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    StorageModule,
    EmailModule,
    WhatsAppModule,
    WebhooksModule,
    AuthModule,
    UsersModule,
    PropFirmsModule,
    PurchasesModule,
    PointsModule,
    RewardsModule,
    RedemptionsModule,
    NotificationsModule,
    AdminModule,
    SupportModule,
  ],
})
export class AppModule {}
