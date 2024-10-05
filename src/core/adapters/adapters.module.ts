import { Global, Module } from '@nestjs/common';
import { CryptoService } from './crypto-service';
import { EmailsManager } from './email.manager';
import { EmailAdapter } from './email.adapter';

@Global()
@Module({
  imports: [],
  controllers: [],
  providers: [CryptoService, EmailsManager, EmailAdapter],
  exports: [CryptoService, EmailsManager, EmailAdapter],
})
export class AdaptersModule {}
