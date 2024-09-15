export type CommentOutputCommentatorInfoModel = {
  userId: string;
  userLogin: string;
};

export enum LikeCommentStatus {
  NONE = 'None',
  LIKE = 'Like',
  DISLIKE = 'Dislike',
}

export interface CommentViewModel {
  id: string;
  content: string;
  commentatorInfo: CommentOutputCommentatorInfoModel;
  createdAt: string;
  likesInfo: CommentLikesViewModel;
}

export interface CommentLikesViewModel {
  likesCount: number;
  dislikesCount: number;
  myStatus: LikeCommentStatus;
}

export type CommentDBType = {
  id: string;
  content: string;
  commentatorInfo: CommentOutputCommentatorInfoModel;
  createdAt: string;
  postId?: string;
};
