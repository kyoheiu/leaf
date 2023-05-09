import React from "react";
import { createContext } from "react";

type ProtectedType = {
  isProtected: boolean;
  setIsProtected: React.Dispatch<React.SetStateAction<boolean>>;
};

export const Protected = createContext<ProtectedType>({
  isProtected: true,
  setIsProtected: () => {},
});

