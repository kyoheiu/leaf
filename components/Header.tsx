import Link from "next/link";
import { createContext, useContext, useEffect, useState } from "react";
import { Grid, Input, PaletteMode, TextField } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import SearchIcon from "@mui/icons-material/Search";
import { Add } from "@mui/icons-material";
import FavoriteIcon from "@mui/icons-material/Favorite";
import ArchiveIcon from "@mui/icons-material/Archive";
import IconButton from "@mui/material/IconButton";
import InvertColorsIcon from "@mui/icons-material/InvertColors";
import { ThemeContext } from "@emotion/react";
import { ColorMode } from "../context/ColorMode";

export const Header = () => {
  const [url, setUrl] = useState<string>("");
  const { mode, setMode } = useContext(ColorMode);

  const handle_input = async (e: any) => {
    e.preventDefault();
    const response = await fetch("http://127.0.0.1:8000/articles", {
      method: "POST",
      body: url,
    });
    if (!response.ok) {
      console.log("Cannot create new article.");
    } else {
      globalThis.location.reload();
    }
  };

  const toggle_theme = () => {
    setMode(() => {
      if (mode === ("light" as PaletteMode)) {
        return "dark" as PaletteMode;
      } else {
        return "light" as PaletteMode;
      }
    });
  };

  return (
    <>
      <Grid container spacing={1} className="header">
        <Grid item xs={3}>
          <Link href="/">acidpaper</Link>
        </Grid>
        <Grid item xs={3}>
          <form action="api/create" method="POST">
            <TextField
              type="URL"
              name="url"
              label={<Add sx={{ fontSize: 20 }} />}
              variant="standard"
              size="small"
              onChange={(e) => setUrl(() => e.target.value)}
            />
          </form>
        </Grid>
        <Grid item xs={3}>
          <form action="/search" method="GET">
            <TextField
              type="text"
              name="q"
              id="query"
              label={<SearchIcon sx={{ fontSize: 20 }} />}
              variant="standard"
              size="small"
            />
          </form>
        </Grid>
        <Grid item xs={1}>
          <Link href="/archived">
            <ArchiveIcon sx={{ fontSize: 20 }} />
          </Link>
        </Grid>
        <Grid item xs={1}>
          <Link href="/liked">
            <FavoriteIcon sx={{ fontSize: 20 }} />
          </Link>
        </Grid>
        <Grid item xs={1}>
          <IconButton onClick={toggle_theme}>
            <InvertColorsIcon sx={{ fontSize: 20 }} />
          </IconButton>
        </Grid>
      </Grid>
    </>
  );
};
