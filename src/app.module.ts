import configuration, { ConfigurationType } from './settings/configuration';
import { MongooseModule } from '@nestjs/mongoose';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { UsersModule } from './features/users/users.module';
import { BlogersModule } from './features/blogs/blogs.module';
import { TestingModule } from './features/testing/testing.module';
import { AuthModule } from './features/auth/auth.module';

import { SecurityModule } from './features/security/security.module';
import { JwtModule } from '@nestjs/jwt';

const modules = [
  UsersModule,
  BlogersModule,
  TestingModule,
  AuthModule,
  SecurityModule,
];

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      envFilePath: '.env',
    }),
    MongooseModule.forRootAsync({
      useFactory: (configService: ConfigService<ConfigurationType, true>) => {
        const apiSettings = configService.get('databaseSettings', {
          infer: true,
        });
        const urlApi = apiSettings.MONGO_CONNECTION_URI;

        return { uri: urlApi };
      },
      inject: [ConfigService],
    }),
    JwtModule.registerAsync({
      global: true,
      useFactory: (configService: ConfigService<ConfigurationType, true>) => {
        const jwtSecret = configService.get('jwtSettings.JWT_SECRET', {
          infer: true,
        });
        return { secret: jwtSecret };
      },
      inject: [ConfigService],
    }),
    ...modules,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
