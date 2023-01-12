export enum State {
  List,
  Reading,
  Archive,
  Liked,
  Search,
}

export interface Article {
  id: string;
  url: string;
  title: string;
  html: string;
  plain: string;
  beginning: string;
  position: number;
  progress: number;
  timestamp: string;
}
