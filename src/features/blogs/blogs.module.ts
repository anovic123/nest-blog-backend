import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { BlogsController } from './blogs/api/blogs.controller';

import { BlogsService } from './blogs/application/blogs.service';

import { BlogsRepository } from './blogs/infra/blogs.repository';
import { BlogsQueryRepository } from './blogs/infra/blogs-query.repository';

import { Blog, blogSchema } from './blogs/domain/blogs.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Blog.name,
        schema: blogSchema,
      },
    ]),
  ],
  controllers: [BlogsController],
  providers: [BlogsService, BlogsRepository, BlogsQueryRepository],
})
export class BlogsModule {}
