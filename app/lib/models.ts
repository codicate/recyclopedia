// this one will need to check based on the logged in user.

export interface UserModel {
  name: string;
  avatar: string;
}

// to determine whether we should revote.
export enum VoteType {
  Like,
  Dislike,
  None
}

export type VoteTypeString = "like" | "dislike" | "none";
export interface VoteModel {
  type: "like" | "dislike" | "none";
  user: number;
}
export const VoteModel = {
  toString(voteType: VoteType): VoteTypeString {
    switch (voteType) {
      case VoteType.Like:
        return "like";
      case VoteType.Dislike:
        return "dislike";
      default:
        return "none";
    }
  },
  fromString(voteType: VoteTypeString) {
    switch (voteType) {
      case "like":    return VoteType.Like;
      case "dislike": return VoteType.Dislike;
      default:        return VoteType.None;
    }
  }
};

export interface CommentModel {
  id: number; // from strapi.
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

  /*
  NOTE(jerry):
  Deprecated or unused at the moment.
  Someone fix this later.
  */
  draftStatus: boolean;
  bannerImage?: string;

  createdAt: Date;
  updatedAt: Date;

  tags: string[];
  votes: VoteModel[];
  comments: CommentModel[];
}
export const ArticleModel = {
  default:  {
    name: "Article Default",
    content: "Article Default Content",
    draftStatus: false,
    createdAt: new Date(),
    updatedAt: new Date(),
    tags: [],
    votes: [],
    comments: []
  }
};

export interface RecycleBinArticleModel extends ArticleModel {
  pendingDaysUntilDeletion: number;
}
