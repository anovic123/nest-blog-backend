import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { Post, PostDocument } from '../domain/post.schema';
import {
  Comments,
  CommentsDocument,
} from '../../comments/domain/comments.schema';
import {
  LikePost,
  LikePostDocument,
  LikePostStatus,
} from '../domain/post-like.schema';

import { getAllPostsHelper, GetAllPostsHelperResult } from '../helper';

import { PaginatedResponse } from '../../../../base/types/pagination';
import { PostViewModel } from '../api/models/output';
import { CommentDBType } from '../../comments/api/models/output';

@Injectable()
export class PostsQueryRepository {
  constructor(
    @InjectModel(Post.name) private PostModel: Model<PostDocument>,
    @InjectModel(Comments.name) private CommentsModel: Model<CommentsDocument>,
    @InjectModel(LikePost.name) private LikePostModel: Model<LikePostDocument>,
  ) {}

  public async getAllPosts(
    query: GetAllPostsHelperResult,
    userId?: string | null | undefined,
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
        items.map((i: any) => this.mapPostOutput(i, userId)),
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
    userId?: string,
  ): Promise<PostViewModel | null> {
    try {
      const findedPost = (await this.PostModel.findOne({
        _id: new Types.ObjectId(id),
      })) as PostDocument;

      if (!findedPost) {
        return null;
      }

      const mappedPost = await this.mapPostOutput(findedPost, userId);

      return mappedPost;
    } catch (error) {
      console.error('findPost', error);
      return null;
    }
  }

  public async mapPostOutput(
    post: PostDocument,
    userId?: string | null | undefined,
  ): Promise<PostViewModel> {
    const likes = await this.LikePostModel.find({
      postId: new Types.ObjectId(post._id).toString(),
    });

    const userLike = userId ? likes.find((l) => l.authorId === userId) : null;

    const likesCount =
      likes.filter((l) => l.status === LikePostStatus.LIKE).length ?? 0;
    const dislikesCount =
      likes.filter((l) => l.status === LikePostStatus.DISLIKE).length ?? 0;
    const myStatus = userLike?.status ?? LikePostStatus.NONE;

    const newestLikes = likes
      .filter((l) => l.status === LikePostStatus.LIKE)
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      )
      .slice(0, 3)
      .map((l) => ({
        addedAt: l.createdAt,
        userId: l.authorId,
        login: l.login,
      }));

    const postForOutput: PostViewModel = {
      id: post._id.toString(),
      title: post.title,
      shortDescription: post.shortDescription,
      content: post.content,
      blogId: post.blogId,
      blogName: post.blogName,
      createdAt: post.createdAt,
      extendedLikesInfo: {
        likesCount,
        dislikesCount,
        myStatus,
        newestLikes: newestLikes.length > 0 ? newestLikes : [],
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
