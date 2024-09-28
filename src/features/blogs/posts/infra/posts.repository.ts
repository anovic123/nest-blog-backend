import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { Post, PostDocument } from '../domain/post.schema';
import { LikePostStatus, PostInputModel, PostViewModel } from '../dto';
import { BlogViewModel } from '../../blogs/dto';

@Injectable()
export class PostsRepository {
  constructor(@InjectModel(Post.name) private PostModel: Model<PostDocument>) {}

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
