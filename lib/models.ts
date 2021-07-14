export interface VoteModel {
  // MongoDB does not know about typescript types
  type: "like" | "dislike" | "none";
  userId: string;
}

export interface ArticleModel {
  name: string;
  content: string;
  draftStatus: boolean;
  bannerImage?: string;
  dateCreated: number;
  dateModified?: number;
  votes: VoteModel[];
  tags?: string[];
}