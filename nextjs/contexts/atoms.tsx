import { atom, RecoilState } from "recoil";
import { ArticleData } from "../types/Types";

export const listState = atom<ArticleData[]>({
  key: "listState",
  default: [],
  dangerouslyAllowMutability: true,
});
