export enum LikePostStatus {
  NONE = 'None',
  LIKE = 'Like',
  DISLIKE = 'Dislike',
}

export type PostLikesViewModel = {
  likesCount: number;
  dislikesCount: number;
  myStatus: LikePostStatus;
  newestLikes: {
    addedAt: string;
    userId: string;
    login: string;
  }[];
};

export type BlogPostViewModel = {
  id: string;
  title: string;
  shortDescription: string;
  content: string;
  blogId: string;
  blogName: string;
  createdAt: string;
  extendedLikesInfo: PostLikesViewModel;
};

export type BlogViewModel = {
  id: string;
  name: string;
  description: string;
  websiteUrl: string;
  createdAt: string;
  isMembership: boolean;
};
