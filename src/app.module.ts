import { MongooseModule } from '@nestjs/mongoose';

import { Module } from '@nestjs/common';
import { UsersModule } from './features/users/users.module';
import { BlogsModule } from './features/blogs/blogs.module';

@Module({
  imports: [
    MongooseModule.forRoot(
      'mongodb+srv://vkanaev220:Q2tgZaS1r9EQIx2i@api-v1.otqbeom.mongodb.net/?retryWrites=true&w=majority&appName=api-v1',
    ),
    UsersModule,
    BlogsModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
