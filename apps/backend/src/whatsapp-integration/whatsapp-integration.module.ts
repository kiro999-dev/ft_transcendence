import { Module } from '@nestjs/common';
import { WhatsappIntegrationController } from './whatsapp-integration.controller';

@Module({ controllers: [WhatsappIntegrationController] })
export class WhatsappIntegrationModule {}
