import Link from "next/link";
import { useContext, useState } from "react";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import { Link as MuiLink } from "@mui/material";
import Grid from "@mui/material/Grid";
import SearchIcon from "@mui/icons-material/Search";
import Add from "@mui/icons-material/Add";
import FavoriteIcon from "@mui/icons-material/Favorite";
import ArchiveIcon from "@mui/icons-material/Archive";
import LightModeIcon from "@mui/icons-material/LightMode";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import CloseIcon from "@mui/icons-material/Close";
import LogoutIcon from "@mui/icons-material/Logout";
import { ColorMode } from "../context/ColorMode";
import { useRouter } from "next/router";
import { signOut } from "next-auth/react";

export const Header = () => {
  const router = useRouter();

  const logo_width = 1.5;
  const button_width = 0.8;
  const blank_space = 12 - logo_width - button_width * 6;
  const logo_size = 28;
  const button_size = 18;

  const [url, setUrl] = useState<string>("");
  const { isLight, setIsLight } = useContext(ColorMode);

  const toggle_theme = () => {
    setIsLight(() => {
      globalThis.sessionStorage.setItem(
        "hmstrTheme",
        isLight ? "dark" : "light"
      );
      return !isLight;
    });
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
    router.push(`/search?q=${split}`);
  };

  return (
    <>
      <Grid container spacing={1} className="header">
        <Grid item xs={logo_width}>
          <MuiLink
            className="site-title"
            component={Link}
            underline="none"
            href="/"
          >
            <img src="logo.png" alt="hmstr" height={logo_size} />
          </MuiLink>
        </Grid>
        <Grid item xs={button_width}>
          <MuiLink href="#" onClick={handleClickAddOpen}>
            <Add sx={{ fontSize: button_size }} />
          </MuiLink>
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
        <Grid item xs={button_width}>
          <MuiLink href="#" onClick={handleClickSearchOpen}>
            <SearchIcon sx={{ fontSize: button_size }} />
          </MuiLink>
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
        <Grid item xs={blank_space} />
        <Grid item xs={button_width}>
          <MuiLink component={Link} href="/archived">
            <ArchiveIcon sx={{ fontSize: button_size }} />
          </MuiLink>
        </Grid>
        <Grid item xs={button_width}>
          <MuiLink component={Link} href="/liked">
            <FavoriteIcon sx={{ fontSize: button_size }} />
          </MuiLink>
        </Grid>
        <Grid item xs={button_width}>
          <MuiLink href="#" onClick={toggle_theme}>
            {isLight ? (
              <DarkModeIcon sx={{ fontSize: button_size }} />
            ) : (
              <LightModeIcon sx={{ fontSize: button_size }} />
            )}
          </MuiLink>
        </Grid>
        <Grid item xs={button_width}>
          <MuiLink href="#" onClick={() => signOut()}>
            <LogoutIcon sx={{ fontSize: button_size }} />
          </MuiLink>
        </Grid>
      </Grid>
    </>
  );
};
