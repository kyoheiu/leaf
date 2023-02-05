import type { AppProps } from "next/app";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { createContext, useContext, useState } from "react";
import { PaletteMode } from "@mui/material";
import React from "react";
import { ColorMode } from "../context/ColorMode";
import "../styles/globals.css";

function MyApp({ Component, pageProps }: AppProps) {
  const session = globalThis.sessionStorage.getItem("acidpaperTheme");
  let initial = true;
  if (session === "dark") {
    initial = false;
  }
  const [isLight, setIsLight] = useState<boolean>(initial);

  const light = createTheme({
    palette: {
      mode: "light",
      primary: {
        main: "#444",
      },
      secondary: {
        main: "#777",
      },
    },
  });

  const dark = createTheme({
    palette: {
      mode: "dark",
      primary: {
        main: "#bbb",
      },
      secondary: {
        main: "#888",
      },
    },
  });

  return (
    <ColorMode.Provider value={{ isLight, setIsLight }}>
      <ThemeProvider theme={isLight ? light : dark}>
        <CssBaseline />
        <Component {...pageProps} />
      </ThemeProvider>
    </ColorMode.Provider>
  );
}

export default MyApp;
