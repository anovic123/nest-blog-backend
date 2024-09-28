import { Module } from '@nestjs/common';
import { EmailAdapter } from './adapters/email.adapter';
import { EmailsManager } from './managers/email.manager';

@Module({
  imports: [],
  providers: [EmailAdapter, EmailsManager],
  exports: [EmailAdapter, EmailsManager],
})
export class EmailModule {}
