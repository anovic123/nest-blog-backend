import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { Post, PostDocument } from '../domain/post.schema';
import {
  Comments,
  CommentsDocument,
} from '../../comments/domain/comments.schema';

import { getAllPostsHelper, GetAllPostsHelperResult } from '../helper';

import { LikePostStatus, PostViewModel } from '../dto';
import { CommentDBType } from './../../comments/dto';

import { PaginatedResponse } from '../../../../types';

@Injectable()
export class PostsQueryRepository {
  constructor(
    @InjectModel(Post.name) private PostModel: Model<PostDocument>,
    @InjectModel(Comments.name) private CommentsModel: Model<CommentsDocument>,
  ) {}

  public async getAllPosts(
    query: GetAllPostsHelperResult,
  ): Promise<PaginatedResponse<PostViewModel>> {
    const sanitizedQuery = getAllPostsHelper(query);

    const search = sanitizedQuery.searchNameTerm
      ? { title: { $regex: sanitizedQuery.searchNameTerm, $options: 'i' } }
      : {};

    const filter = {
      ...search,
    };

    const sortDirection = sanitizedQuery.sortDirection === 'asc' ? 1 : -1;
    const sortBy = sanitizedQuery.sortBy || 'createdAt';

    try {
      const items: any = await this.PostModel.find(filter)
        .sort({ [sortBy]: sortDirection })
        .skip((sanitizedQuery.pageNumber - 1) * sanitizedQuery.pageSize)
        .limit(sanitizedQuery.pageSize)
        .exec();

      const totalCount = await this.PostModel.countDocuments(filter);

      const mappedItems = await Promise.all(
        items.map((i: any) => this.mapPostOutput(i)),
      );

      return {
        pagesCount: Math.ceil(totalCount / (query.pageSize ?? 10)),
        page: sanitizedQuery.pageNumber,
        pageSize: sanitizedQuery.pageSize,
        totalCount,
        items: mappedItems,
      };
    } catch (error) {
      console.error(error);
      return {
        pagesCount: 0,
        page: 0,
        pageSize: 0,
        totalCount: 0,
        items: [],
      };
    }
  }

  public async findPostsAndMap(
    id: PostViewModel['id'],
  ): Promise<PostViewModel | null> {
    try {
      const findedPost = (await this.PostModel.findOne({
        _id: new Types.ObjectId(id),
      })) as PostDocument;

      if (!findedPost) {
        return null;
      }

      const mappedPost = await this.mapPostOutput(findedPost);

      return mappedPost;
    } catch (error) {
      console.error('findPost', error);
      return null;
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

  public async getPostsComments(
    query: GetAllPostsHelperResult,
    postId: string,
  ) {
    const sanitizedQuery = getAllPostsHelper(query);

    const filter: {
      postId?: string;
      title?: { $regex: string; $options: string };
    } = {};

    if (postId) {
      filter.postId = postId;
    }

    if (sanitizedQuery.searchNameTerm) {
      filter.title = { $regex: sanitizedQuery.searchNameTerm, $options: 'i' };
    }

    const sortDirection = sanitizedQuery.sortDirection === 'asc' ? 1 : -1;
    const sortBy = sanitizedQuery.sortBy || 'createdAt';

    try {
      const items = await this.CommentsModel.find(filter)
        .sort({ [sortBy]: sortDirection })
        .skip((sanitizedQuery.pageNumber - 1) * sanitizedQuery.pageSize)
        .limit(sanitizedQuery.pageSize)
        .exec();

      const totalCount = await this.CommentsModel.countDocuments(filter);

      const mappedItems = await Promise.all(
        items.map((i: CommentDBType) => this.mapPostCommentsOutput(i)),
      );

      return {
        pagesCount: Math.ceil(totalCount / (query.pageSize ?? 10)),
        page: sanitizedQuery.pageNumber,
        pageSize: sanitizedQuery.pageSize,
        totalCount,
        items: mappedItems,
      };
    } catch (error) {
      console.error('Error fetching post comments:', error);
      throw new Error('Could not fetch post comments');
    }
  }

  protected async mapPostCommentsOutput(comment: CommentDBType) {
    try {
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
          myStatus: LikePostStatus.NONE,
        },
      };
      return commentForOutput;
    } catch (error) {
      console.error('mapPostCommentsOutput', error);
      return null;
    }
  }
}
