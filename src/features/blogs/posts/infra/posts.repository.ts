import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { LikePostStatus, PostInputModel, PostViewModel } from '../dto';
import { BlogViewModel } from '../../blogs/api/models/output';

import { Post, PostDocument } from '../domain/post.schema';
import { User } from 'src/features/users/domain/users.schema';
import { LikePost, LikePostDocument } from '../domain/post-like.schema';

@Injectable()
export class PostsRepository {
  constructor(
    @InjectModel(Post.name) private PostModel: Model<PostDocument>,
    @InjectModel(LikePost.name) private LikePostModel: Model<LikePostDocument>,
  ) {}

  public async createPost(post: PostDocument): Promise<boolean> {
    try {
      const newPost = await this.PostModel.create(post);
      return !!newPost;
    } catch (error) {
      console.error('Error creating post:', error);
      return false;
    }
  }

  public async putPost(
    post: PostInputModel,
    id: string,
    blogName: BlogViewModel['name'],
  ): Promise<boolean> {
    try {
      const result = await this.PostModel.updateOne(
        { _id: new Types.ObjectId(id) },
        {
          $set: {
            ...post,
            blogName: blogName,
          },
        },
      );

      return result.matchedCount === 1;
    } catch (error) {
      console.error('Error updating post:', error);
      return false;
    }
  }

  public async deletePost(id: PostViewModel['id']): Promise<boolean> {
    try {
      const deleteResult = await this.PostModel.deleteOne({
        _id: new Types.ObjectId(id),
      });
      return deleteResult.deletedCount === 1;
    } catch (error) {
      console.error('Error deleting post:', error);
      return false;
    }
  }

  public async isPostExisted(postId: string): Promise<boolean> {
    const isValid = Types.ObjectId.isValid(postId);

    if (!isValid) {
      return false;
    }

    return !!(await this.PostModel.countDocuments({
      _id: new Types.ObjectId(postId),
    }));
  }

  public async likePost(userId: User['_id'], postId: string, login: string) {
    await this.LikePostModel.findOneAndUpdate(
      { postId, authorId: userId },
      {
        status: LikePostStatus.LIKE,
        postId,
        createdAt: new Date().toISOString(),
        login,
      },
      {
        upsert: true,
        new: true,
        runValidators: true,
      },
    );

    return true;
  }

  public async dislikePost(
    userId: User['_id'],
    postId: string,
    login: string,
  ): Promise<boolean> {
    await this.LikePostModel.findOneAndUpdate(
      { postId, authorId: userId },
      {
        status: LikePostStatus.DISLIKE,
        postId,
        createdAt: new Date().toISOString(),
        login,
      },
      {
        upsert: true,
        new: true,
        runValidators: true,
      },
    );
    return true;
  }

  public async noneStatusPost(
    userId: User['_id'],
    postId: string,
    login: string,
  ): Promise<boolean> {
    await this.LikePostModel.findByIdAndUpdate(
      {
        postId,
        authorId: userId,
      },
      {
        status: LikePostStatus.NONE,
        postId,
        createdAt: new Date().toISOString(),
        login,
      },
      {
        upsert: true,
        new: true,
        runValidators: true,
      },
    );

    return true;
  }

  public async mapPostOutput(post: PostDocument): Promise<PostViewModel> {
    const postForOutput: PostViewModel = {
      id: post._id.toString(),
      title: post.title,
      shortDescription: post.shortDescription,
      content: post.content,
      blogId: post.blogId,
      blogName: post.blogName,
      createdAt: post.createdAt,
      extendedLikesInfo: {
        likesCount: 0,
        dislikesCount: 0,
        myStatus: LikePostStatus.NONE,
        newestLikes: [],
      },
    };

    return postForOutput;
  }
}
