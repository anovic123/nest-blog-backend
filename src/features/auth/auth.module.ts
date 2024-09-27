import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';

import { AuthGuard } from 'src/core/infrastructure/guards/auth.guard';

@Module({
  imports: [
    JwtModule.register({
      global: true,
      secret: 'qwqweqeqe123',
      signOptions: { expiresIn: '60s' },
    }),
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
  ],
  controllers: [],
  exports: [],
})
export class AuthModule {}
