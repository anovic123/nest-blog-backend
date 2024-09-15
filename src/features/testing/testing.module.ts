import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { Blog, blogSchema } from '../blogs/blogs/domain/blogs.schema';
import { Post, postSchema } from '../blogs/posts/domain/post.schema';
import {
  Comments,
  commentsSchema,
} from '../blogs/comments/domain/comments.schema';
import { User, userSchema } from '../users/domain/users.schema';

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
  ],
  controllers: [],
  providers: [],
})
export class TestingModule {}
