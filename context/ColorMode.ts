import { Palette } from "@mui/icons-material";
import { PaletteMode } from "@mui/material";
import React from "react";
import { createContext } from "react";

type ColorModeType = {
  mode: PaletteMode;
  setMode: React.Dispatch<React.SetStateAction<PaletteMode>>;
};

export const ColorMode = createContext<ColorModeType>({
  mode: "light" as PaletteMode,
  setMode: () => {},
});
