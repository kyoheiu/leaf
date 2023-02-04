import Link from "next/link";
import { Button, Link as MuiLink } from "@mui/material";
import { createContext, useContext, useEffect, useState } from "react";
import { Grid, Input, PaletteMode, TextField } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import SearchIcon from "@mui/icons-material/Search";
import { Add } from "@mui/icons-material";
import FavoriteIcon from "@mui/icons-material/Favorite";
import ArchiveIcon from "@mui/icons-material/Archive";
import InvertColorsIcon from "@mui/icons-material/InvertColors";
import { ThemeContext } from "@emotion/react";
import { ColorMode } from "../context/ColorMode";
import LightModeIcon from "@mui/icons-material/LightMode";
import DarkModeIcon from "@mui/icons-material/DarkMode";

export const Header = () => {
  const [url, setUrl] = useState<string>("");
  const { isLight, setIsLight } = useContext(ColorMode);

  const toggle_theme = () => {
    setIsLight(() => !isLight);
  };

  return (
    <>
      <Grid container spacing={1} className="header">
        <Grid item xs={3}>
          <MuiLink component={Link} underline="none" href="/">
            acidpaper
          </MuiLink>
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
          <MuiLink component={Link} href="/archived">
            <ArchiveIcon sx={{ fontSize: 20 }} />
          </MuiLink>
        </Grid>
        <Grid item xs={1}>
          <MuiLink component={Link} href="/liked">
            <FavoriteIcon sx={{ fontSize: 20 }} />
          </MuiLink>
        </Grid>
        <Grid item xs={1}>
          <Button onClick={toggle_theme}>
            {isLight ? (
              <DarkModeIcon sx={{ fontSize: 20 }} />
            ) : (
              <LightModeIcon sx={{ fontSize: 20 }} />
            )}
          </Button>
        </Grid>
      </Grid>
    </>
  );
};
