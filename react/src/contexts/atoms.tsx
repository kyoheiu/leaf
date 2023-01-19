import { atom, RecoilState } from "recoil";
import { ArticleData } from "../Types";

export const listState = atom<ArticleData[]>({
  key: "listState",
  default: [],
});
