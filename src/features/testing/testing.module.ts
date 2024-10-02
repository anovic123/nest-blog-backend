import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { Blog, blogSchema } from '../blogs/blogs/domain/blogs.schema';
import { Post, postSchema } from '../blogs/posts/domain/post.schema';
import {
  Comments,
  commentsSchema,
} from '../blogs/comments/domain/comments.schema';
import { User, userSchema } from '../users/domain/users.schema';
import {
  LikePost,
  postLikeSchema,
} from '../blogs/posts/domain/post-like.schema';

import { TestingService } from './application/testing.service';

import { TestingRepository } from './infra/testing.repository';

import { TestingController } from './api/testing.controller';

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
    MongooseModule.forFeature([
      {
        name: User.name,
        schema: userSchema,
      },
    ]),
    MongooseModule.forFeature([
      {
        name: LikePost.name,
        schema: postLikeSchema,
      },
    ]),
  ],
  controllers: [TestingController],
  providers: [TestingService, TestingRepository],
})
export class TestingModule {}
