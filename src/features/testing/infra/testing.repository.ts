import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Blog, BlogsDocument } from '../../blogs/blogs/domain/blogs.schema';
import {
  Comments,
  CommentsDocument,
} from '../../blogs/comments/domain/comments.schema';
import { Post, PostDocument } from '../../blogs/posts/domain/post.schema';
import { User, UserDocument } from '../../users/domain/users.schema';
import {
  LikePost,
  LikePostDocument,
} from 'src/features/blogs/posts/domain/post-like.schema';

@Injectable()
export class TestingRepository {
  constructor(
    @InjectModel(Blog.name) private BlogModel: Model<BlogsDocument>,
    @InjectModel(Post.name) private PostModel: Model<PostDocument>,
    @InjectModel(Comments.name) private CommentsModel: Model<CommentsDocument>,
    @InjectModel(User.name) private UserModel: Model<UserDocument>,
    @InjectModel(LikePost.name) private LikePostModel: Model<LikePostDocument>,
  ) {}

  public async deleteAll(): Promise<boolean> {
    try {
      await Promise.all([
        this.BlogModel.deleteMany({}),
        this.PostModel.deleteMany({}),
        this.CommentsModel.deleteMany({}),
        this.UserModel.deleteMany({}),
        this.LikePostModel.deleteMany({}),
      ]);

      return true;
    } catch (error) {
      console.error(error);
      return false;
    }
  }
}
