export class CommentOutputCommentatorInfoModel {
  userId: string;
  userLogin: string;
}

export enum LikeCommentStatus {
  NONE = 'None',
  LIKE = 'Like',
  DISLIKE = 'Dislike',
}

export class CommentViewModel {
  id: string;
  content: string;
  commentatorInfo: CommentOutputCommentatorInfoModel;
  createdAt: string;
  likesInfo: CommentLikesViewModel;
}

export class CommentLikesViewModel {
  likesCount: number;
  dislikesCount: number;
  myStatus: LikeCommentStatus;
}

export class CommentDBType {
  id: string;
  content: string;
  commentatorInfo: CommentOutputCommentatorInfoModel;
  createdAt: string;
  postId?: string;
}
