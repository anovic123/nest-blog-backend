import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { BlogsController } from './blogs/api/blogs.controller';
import { PostsController } from './posts/api/posts.controller';
import { CommentsController } from './comments/api/comments.controller';

import { BlogsService } from './blogs/application/blogs.service';
import { PostsService } from './posts/application/posts.service';

import { BlogsRepository } from './blogs/infra/blogs.repository';
import { PostsRepository } from './posts/infra/posts.repository';
import { BlogsQueryRepository } from './blogs/infra/blogs-query.repository';
import { CommentsQueryRepository } from './comments/infra/comments-query.repository';
import { PostsQueryRepository } from './posts/infra/posts-query-repository';

import { Blog, blogSchema } from './blogs/domain/blogs.schema';
import { Post, postSchema } from './posts/domain/post.schema';
import { Comments, commentsSchema } from './comments/domain/comments.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Blog.name,
        schema: blogSchema,
      },
    ]),
    MongooseModule.forFeature([
      {
        name: Post.name,
        schema: postSchema,
      },
    ]),
    MongooseModule.forFeature([
      {
        name: Comments.name,
        schema: commentsSchema,
      },
    ]),
  ],
  controllers: [BlogsController, PostsController, CommentsController],
  providers: [
    BlogsService,
    BlogsRepository,
    BlogsQueryRepository,
    PostsService,
    PostsRepository,
    PostsQueryRepository,
    CommentsQueryRepository,
  ],
})
export class BlogsModule {}
