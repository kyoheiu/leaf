import { ArticleData } from "../types/types";
import { useState, useEffect, Dispatch, SetStateAction } from "react";

const useReloadEffect = (
  target: string,
  isBottom: boolean,
  setIsBottom: Dispatch<SetStateAction<boolean>>,
  list: ArticleData[],
  setList: Dispatch<SetStateAction<ArticleData[]>>,
  setIsLast: Dispatch<SetStateAction<boolean>>
) => {
  useEffect(() => {
    (async () => {
      if (isBottom && list.length !== 0) {
        const res = await fetch(target);
        const j = await res.json();
        if (j.length === 0) {
          setIsLast(true);
        } else {
          setList((arr) => arr.concat(j));
        }
        setIsBottom(false);
      }
    })();
  });
};

export default useReloadEffect;
