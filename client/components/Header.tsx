import Link from "next/link";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Link as MuiLink,
} from "@mui/material";
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
import CloseIcon from "@mui/icons-material/Close";
import { useRouter } from "next/router";

export const Header = () => {
  const router = useRouter();

  const [url, setUrl] = useState<string>("");
  const { isLight, setIsLight } = useContext(ColorMode);

  const toggle_theme = () => {
    setIsLight(() => !isLight);
    globalThis.sessionStorage.setItem(
      "acidPaperTheme",
      isLight ? "light" : "dark"
    );
  };

  const [addOpen, setAddOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  const handleClickAddOpen = () => {
    setAddOpen(true);
  };

  const handleAddClose = () => {
    setAddOpen(false);
  };

  const handleClickSearchOpen = () => {
    setSearchOpen(true);
  };

  const handleSearchClose = () => {
    setSearchOpen(false);
  };

  const submitAndClose = async () => {
    const url = (document.getElementById("add_new_article") as HTMLInputElement)
      .value;
    const res = await fetch("/api/create", {
      method: "POST",
      body: url,
    });
    setAddOpen(false);
    if (!res.ok) {
      console.log("Cannot create new article.");
    } else {
      router.push("/");
      router.reload();
    }
  };

  const searchAndClose = async () => {
    const queries: string = (
      document.getElementById("search") as HTMLInputElement
    ).value;
    const split = queries
      .split(/(\s+)/)
      .filter((x) => x.trim().length > 0)
      .join("+");
    router.push("/search?q=" + split);
  };

  return (
    <>
      <Grid container spacing={1} className="header">
        <Grid item xs={2}>
          <MuiLink component={Link} underline="none" href="/">
            acidpaper
          </MuiLink>
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
        <Grid item xs={5}></Grid>
        <Grid item xs={1}>
          <Button size="small" onClick={handleClickAddOpen}>
            <Add sx={{ fontSize: 20 }} />
          </Button>
          <Dialog open={addOpen} onClose={handleAddClose}>
            <DialogTitle>Add new article.</DialogTitle>
            <DialogContent>
              <TextField
                autoFocus
                margin="dense"
                id={"add_new_article"}
                label="URL to add"
                type="text"
                fullWidth
                variant="standard"
              />
            </DialogContent>
            <DialogActions>
              <Button onClick={handleAddClose}>
                <CloseIcon />
              </Button>
              <Button onClick={submitAndClose}>
                <Add />
              </Button>
            </DialogActions>
          </Dialog>
        </Grid>
        <Grid item xs={1}>
          <Button size="small" onClick={handleClickSearchOpen}>
            <SearchIcon sx={{ fontSize: 20 }} />
          </Button>
          <Dialog open={searchOpen} onClose={handleSearchClose}>
            <DialogTitle>Search.</DialogTitle>
            <DialogContent>
              <TextField
                autoFocus
                margin="dense"
                id={"search"}
                label=""
                type="text"
                fullWidth
                variant="standard"
              />
            </DialogContent>
            <DialogActions>
              <Button onClick={handleSearchClose}>
                <CloseIcon />
              </Button>
              <Button onClick={searchAndClose}>
                <SearchIcon />
              </Button>
            </DialogActions>
          </Dialog>
        </Grid>
        <Grid item xs={1}>
          <Button size="small" onClick={toggle_theme}>
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
