import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';

import { BlogsQueryRepository } from '../infra/blogs-query.repository';

import { BlogsService } from '../application/blogs.service';

import { BasicAuthGuard } from 'src/core/guards/auth-basic.guard';

import { BlogInputModel } from './models/input/blog.input.model';
import { BlogPostInputModel } from './models/input/blog-post.input.model';
import { CreateBlogCommand } from '../application/use-cases/create-blog.use-case';
import { UpdateBlogCommand } from '../application/use-cases/update-blog.use-case';
import { DeleteBlogCommand } from '../application/use-cases/delete-blog.use-case';
import { CreatePostBlogCommand } from '../application/use-cases/create-post-blog.use-case';
import { AuthGuard } from '../../../../core/guards/auth.guard';
import { Public } from '../../../../core/decorators/public.decorator';
import { RequestWithUser } from '../../../../base/types/request';

@Controller('blogs')
export class BlogsController {
  constructor(
    private readonly blogsService: BlogsService,
    private readonly blogsQueryRepository: BlogsQueryRepository,
    private readonly commandBus: CommandBus,
  ) {}

  @UseGuards(BasicAuthGuard)
  @Post()
  public async createBlog(@Body() createBlogModel: BlogInputModel) {
    return this.commandBus.execute(new CreateBlogCommand(createBlogModel));
  }

  @Get()
  public async getBlogs(@Query() query: { [key: string]: string | undefined }) {
    return this.blogsQueryRepository.getAllBlogs(query);
  }

  @Get('/:id')
  public async getBlogsById(@Param('id') id: string) {
    const blog = await this.blogsQueryRepository.findBlog(id);

    if (!blog) {
      throw new NotFoundException(`Blog with id ${id} not found`);
    }

    return blog;
  }

  @UseGuards(BasicAuthGuard)
  @Put('/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  public async putBlogs(@Body() body: BlogInputModel, @Param('id') id: string) {
    return this.commandBus.execute(new UpdateBlogCommand(body, id));
  }

  @UseGuards(BasicAuthGuard)
  @Delete('/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  public async deleteUser(@Param('id') id: string) {
    return this.commandBus.execute(new DeleteBlogCommand(id));
  }

  @Public()
  @UseGuards(AuthGuard)
  @Get('/:blogId/posts')
  public async getBlogPosts(
    @Param('blogId') blogId: string,
    @Query() query: { [key: string]: string | undefined },
    @Req() request: RequestWithUser,
  ) {
    const user = request['user'];

    const blogPostsResults = await this.blogsQueryRepository.getBlogPosts(
      query,
      blogId,
      user?.userId,
    );

    if (!blogPostsResults || blogPostsResults.items.length === 0) {
      throw new NotFoundException(`Blog posts with id ${blogId} not found`);
    }

    return blogPostsResults;
  }

  @UseGuards(BasicAuthGuard)
  @Post('/:blogId/posts')
  public async createBlogsPost(
    @Param('blogId') blogId: string,
    @Body() body: BlogPostInputModel,
  ) {
    return this.commandBus.execute(new CreatePostBlogCommand(blogId, body));
  }
}
