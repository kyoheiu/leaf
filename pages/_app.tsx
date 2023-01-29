import type { AppProps } from "next/app";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { createContext, useContext } from "react";
import { PaletteMode } from "@mui/material";

export const ColorMode = createContext<PaletteMode>("light");

function MyApp({ Component, pageProps }: AppProps) {
  const mode = useContext(ColorMode);

  const theme = createTheme({
    palette: {
      mode: mode,
    },
  });

  return (
    <ColorMode.Provider value={mode}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Component {...pageProps} />
      </ThemeProvider>
    </ColorMode.Provider>
  );
}

export default MyApp;
