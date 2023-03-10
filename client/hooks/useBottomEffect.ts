import { useState, useEffect, Dispatch, SetStateAction } from "react";

const useBottomEffect = (setIsBottom: Dispatch<SetStateAction<boolean>>) => {
  useEffect(() => {
    globalThis.addEventListener("scroll", () => {
      const footer = document.getElementById("reload");
      const rect = footer?.getBoundingClientRect();
      if (rect && rect!.top <= document.documentElement.clientHeight + 50) {
        setIsBottom(true);
      }
    });
  }, []);
};

export default useBottomEffect;
