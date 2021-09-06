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
  createdAt: Date;
  user: UserModel;
  votes: VoteModel[];
}

// This is a partial version of the article
// with optional fields. This is because we won't necessarily
// be filling out all the fields.
export interface ArticleDraftModel {
  name: string;
  content: string;
  dateCreated?: Date;
  tags?: string[];
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