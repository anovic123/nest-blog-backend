import { MongooseModule } from '@nestjs/mongoose';

import { Module } from '@nestjs/common';
import { UsersModule } from './features/users/users.module';
import { BlogersModule } from './features/blogs/blogs.module';
import { TestingModule } from './features/testing/testing.module';
import { appSettings } from './settings/app-settings';

@Module({
  imports: [
    MongooseModule.forRoot(
      appSettings.env.isTesting()
        ? appSettings.api.MONGO_CONNECTION_URI_FOR_TESTS
        : appSettings.api.MONGO_CONNECTION_URI,
    ),
    UsersModule,
    BlogersModule,
    TestingModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
