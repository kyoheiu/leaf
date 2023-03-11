export interface Articles {
  data: ArticleData[];
  is_last: boolean
}

export interface ArticleData {
  id: string;
  url: string;
  title: string;
  og: string;
  beginning: string;
  progress: number;
  archived: boolean;
  liked: boolean;
  timestamp: string;
  tags: string[];
}

export interface WrappedData {
  visible: boolean;
  data: ArticleData;
}

export interface ArticleContent {
  id: string;
  url: string;
  title: string;
  html: string;
  plain: string;
  position: number;
  progress: number;
  archived: boolean;
  liked: boolean;
  timestamp: string;
}

export enum ElementKind {
  Top,
  Archived,
  Liked,
  Searched,
}

export interface ElementProps {
  element: WrappedData;
  kind: ElementKind;
}

export interface TagsProps {
  tags: string[];
}
