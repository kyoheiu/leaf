export enum State {
  Top = "Top",
  Search = "Search",
  Tag = "Tag",
  Reading = "Reading",
}

export interface ArticleData {
  id: string;
  url: string;
  title: string;
  beginning: string;
  progress: number;
  archived: boolean;
  liked: boolean;
  timestamp: string;
  tags: string[];
}

export interface ArticleContent {
  id: string;
  url: string;
  title: string;
  html: string;
  plain: string;
  position: string;
  progress: number;
  archived: boolean;
  liked: boolean;
  timestamp: string;
}
