import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CqrsModule } from '@nestjs/cqrs';

import { BlogsController } from './blogs/api/blogs.controller';
import { PostsController } from './posts/api/posts.controller';
import { CommentsController } from './comments/api/comments.controller';

import { BlogsService } from './blogs/application/blogs.service';
import { PostsService } from './posts/application/posts.service';
import { CommentsService } from './comments/application/comments.service';

import { BlogsRepository } from './blogs/infra/blogs.repository';
import { PostsRepository } from './posts/infra/posts.repository';
import { BlogsQueryRepository } from './blogs/infra/blogs-query.repository';
import { CommentsQueryRepository } from './comments/infra/comments-query.repository';
import { PostsQueryRepository } from './posts/infra/posts-query-repository';
import { UsersRepository } from '../users/infra/users.repository';
import { CommentsRepository } from './comments/infra/comments.repository';

import { Blog, blogSchema } from './blogs/domain/blogs.schema';
import { Post, postSchema } from './posts/domain/post.schema';
import {
  Comments,
  commentsSchema,
  LikesComment,
  likesCommentsSchema,
} from './comments/domain/comments.schema';
import { User, userSchema } from '../users/domain/users.schema';
import { LikePost, postLikeSchema } from './posts/domain/post-like.schema';

import { CreatePostUseCase } from './posts/application/use-cases/create-post.use-case';
import { UpdatePostByIdUseCase } from './posts/application/use-cases/update-post-by-id.use-case';
import { DeletePostUseCase } from './posts/application/use-cases/delete-post.use-case';
import { CreateBlogUseCase } from './blogs/application/use-cases/create-blog.use-case';
import { UpdateBlogUseCase } from './blogs/application/use-cases/update-blog.use-case';
import { DeleteBlogUseCase } from './blogs/application/use-cases/delete-blog.use-case';
import { CreatePostBlogUseCase } from './blogs/application/use-cases/create-post-blog.use-case';
import { DeleteCommentUseCase } from './comments/application/use-cases/delete-comment.use-case';
import { UpdateCommentUseCase } from './comments/application/use-cases/update-comment.use-case';
import { UpdateLikeCommentUseCase } from './comments/application/use-cases/update-like-comment.use-case';
import { CreatePostCommentUseCase } from './posts/application/use-cases/create-post-comment.';

@Module({
  imports: [
    CqrsModule,
    MongooseModule.forFeature([
      { name: Blog.name, schema: blogSchema },
      { name: Post.name, schema: postSchema },
      { name: Comments.name, schema: commentsSchema },
      { name: User.name, schema: userSchema },
      { name: LikePost.name, schema: postLikeSchema },
      { name: LikesComment.name, schema: likesCommentsSchema },
    ]),
  ],
  controllers: [BlogsController, PostsController, CommentsController],
  providers: [
    CreatePostUseCase,
    UpdatePostByIdUseCase,
    DeletePostUseCase,
    CreateBlogUseCase,
    UpdateBlogUseCase,
    DeleteBlogUseCase,
    CreatePostBlogUseCase,
    DeleteCommentUseCase,
    UpdateCommentUseCase,
    UpdateLikeCommentUseCase,
    CreatePostCommentUseCase,
    BlogsService,
    BlogsRepository,
    BlogsQueryRepository,
    PostsService,
    PostsRepository,
    PostsQueryRepository,
    CommentsQueryRepository,
    UsersRepository,
    CommentsService,
    CommentsRepository,
  ],
})
export class BlogersModule {}
