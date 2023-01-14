import { ArticleData } from "./Types";

export const show_archived = (e: ArticleData) => {
  return e.archived;
};

export const hide_archived = (e: ArticleData) => {
  return !e.archived;
};

export const show_liked_only = (e: ArticleData) => {
  return e.liked;
};

export const filter_list = (arr: ArticleData[]): ArticleData[] => {
  const tuple = [showArchived(), showLiked()];
  switch (tuple.join(",")) {
    case "false,false":
      return arr.filter(hide_archived);
    case "false,true":
      return arr.filter(hide_archived).filter(show_liked_only);
    case "true,false":
      return arr.filter(show_archived);
    case "true,true":
      return arr.filter(show_archived).filter(show_liked_only);
  }
  return [];
};

const update_list = async () => {
  const res = await fetch("http://localhost:8000/");
  const j = await res.json();
  setList(() => filter_list(j));
};
