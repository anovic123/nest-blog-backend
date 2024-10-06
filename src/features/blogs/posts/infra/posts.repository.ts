import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { BlogViewModel } from '../../blogs/api/models/output';

import { Post, PostDocument } from '../domain/post.schema';
import { User } from 'src/features/users/domain/users.schema';
import {
  LikePost,
  LikePostDocument,
  LikePostStatus,
} from '../domain/post-like.schema';

import { PostInputModel } from '../api/models/input/create-post.input.model';
import { PostViewModel } from '../api/models/output';
import {
  Comments,
  CommentsDocument,
} from '../../comments/domain/comments.schema';
import {
  CommentDBType,
  CommentViewModel,
  LikeCommentStatus,
} from '../../comments/api/models/output';

@Injectable()
export class PostsRepository {
  constructor(
    @InjectModel(Post.name) private PostModel: Model<PostDocument>,
    @InjectModel(LikePost.name) private LikePostModel: Model<LikePostDocument>,
    @InjectModel(Comments.name)
    private readonly CommentsModel: Model<CommentsDocument>,
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

  public async isExistedPost(id: string): Promise<boolean> {
    const isValidId = Types.ObjectId.isValid(id);

    if (!isValidId) return false;
    const res = await this.PostModel.find({ _id: id });

    return res.length > 0;
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
    await this.LikePostModel.findOneAndUpdate(
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

  public async createPostComment(
    comment: CommentDBType,
  ): Promise<CommentViewModel | null> {
    const result = await this.CommentsModel.create(comment);
    return this.mapPostCommentsOutput(comment);
  }

  public mapPostCommentsOutput(comment: CommentDBType): CommentViewModel {
    const commentForOutput = {
      id: comment.id,
      content: comment.content,
      commentatorInfo: {
        userId: comment.commentatorInfo.userId,
        userLogin: comment.commentatorInfo.userLogin,
      },
      createdAt: comment.createdAt,
      likesInfo: {
        likesCount: 0,
        dislikesCount: 0,
        myStatus: LikeCommentStatus.NONE,
      },
    };
    return commentForOutput;
  }
}
