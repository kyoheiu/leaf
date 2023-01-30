import { Palette } from "@mui/icons-material";
import { PaletteMode } from "@mui/material";
import React from "react";
import { createContext } from "react";

type ColorModeType = {
  isLight: boolean;
  setIsLight: React.Dispatch<React.SetStateAction<boolean>>;
};

export const ColorMode = createContext<ColorModeType>({
  isLight: true,
  setIsLight: () => {},
});
