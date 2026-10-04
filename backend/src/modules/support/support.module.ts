import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { SupportService } from './support.service';
import { SupportController, LiveChatSyncController } from './support.controller';
import { ChatGateway } from './chat.gateway';
import { PrismaModule } from '../../prisma/prisma.module';
import { getJwtSecret } from '../../common/config/jwt.config';

@Module({
  imports: [
    PrismaModule,
    JwtModule.register({
      secret: getJwtSecret(),
      signOptions: { expiresIn: '7d' },
    }),
  ],
  controllers: [SupportController, LiveChatSyncController],
  providers: [SupportService, ChatGateway],
  exports: [SupportService, ChatGateway],
})
export class SupportModule {}
