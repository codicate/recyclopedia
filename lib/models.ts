// this one will need to check based on the logged in user.

export interface UserModel {
  name: string;
  avatar: string;
}

// to determine whether we should revote.
export enum VoteType {
  Like,
  Dislike
}

export interface VoteModel {
  // MongoDB does not know about typescript types
  type: "like" | "dislike" | "none";
  userId: string;
}

export interface CommentModel {
  content: string;
  createdAt: number;
  user: UserModel;
  votes: VoteModel[];
}

export interface ArticleModel {
  name: string;
  content: string;
  draftStatus: boolean;
  bannerImage?: string;
  dateCreated: Date;
  dateModified?: Date;
  tags?: string[];
  votes: VoteModel[];
  comments: CommentModel[];
}

export interface RecycleBinArticleModel extends ArticleModel {
  pendingDaysUntilDeletion: number;
}