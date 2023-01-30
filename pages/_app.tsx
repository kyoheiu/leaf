import type { AppProps } from "next/app";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { createContext, useContext, useState } from "react";
import { PaletteMode } from "@mui/material";
import React from "react";
import { ColorMode } from "../context/ColorMode";

function MyApp({ Component, pageProps }: AppProps) {
  const [mode, setMode] = useState<PaletteMode>("light");

  const theme = createTheme({
    palette: {
      mode: mode,
    },
  });

  return (
    <ColorMode.Provider value={{ mode, setMode }}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Component {...pageProps} />
      </ThemeProvider>
    </ColorMode.Provider>
  );
}

export default MyApp;
