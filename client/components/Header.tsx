import Link from "next/link";
import { useContext, useState } from "react";
import TextField from "@mui/material/TextField";
import { Link as MuiLink } from "@mui/material";
import Button from "@mui/material/Button";
import Backdrop from "@mui/material/Backdrop";
import CircularProgress from "@mui/material/CircularProgress";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Grid from "@mui/material/Grid";
import FavoriteIcon from "@mui/icons-material/Favorite";
import ArchiveIcon from "@mui/icons-material/Archive";
import LightModeIcon from "@mui/icons-material/LightMode";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import LogoutIcon from "@mui/icons-material/Logout";
import MenuIcon from "@mui/icons-material/Menu";
import { ColorMode } from "../context/ColorMode";
import Image from "next/image";
import { useRouter } from "next/router";
import { signOut } from "next-auth/react";
import Head from "next/head";
import toast from "react-simple-toasts";

export const Header = () => {
  const router = useRouter();

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };
  const logo_width = 1;
  const button_width = 0.8;
  const input_width = 3.5;
  const blank_space = 12 - logo_width - button_width - input_width * 2;
  const logo_size = 28;
  const button_size = 18;

  const [url, setUrl] = useState<string>("");
  const [query, setQuery] = useState<string>("");
  const [progress, setProgress] = useState(false);
  const { isLight, setIsLight } = useContext(ColorMode);

  const toggleTheme = () => {
    setIsLight(() => {
      globalThis.sessionStorage.setItem(
        "hmstrTheme",
        isLight ? "dark" : "light"
      );
      return !isLight;
    });
  };

  const createNew = async (e: React.FormEvent) => {
    e.preventDefault();
    setProgress(true);
    console.log(url);
    const res = await fetch("/api/articles", {
      method: "POST",
      body: url,
    });
    setProgress(false);
    if (!res.ok) {
      toast(res.statusText);
    } else {
      router.push("/");
      router.reload();
    }
  };

  const search = async (e: React.FormEvent) => {
    const split = query
      .split(/(\s+)/)
      .filter((x) => x.trim().length > 0)
      .join("+");
    router.push(`/search?q=${split}`);
  };

  return (
    <>
      <Head>
        <title>{process.env.NEXT_PUBLIC_TITLE}</title>
      </Head>
      <Backdrop open={progress}>
        <CircularProgress />
      </Backdrop>
      <Grid container spacing={1} className="header">
        <Grid item xs={logo_width}>
          <MuiLink
            className="site-title"
            component={Link}
            underline="none"
            href="/"
          >
            <Image
              src="/logo.png"
              alt="hmstr"
              height={logo_size}
              width={logo_size}
            />
          </MuiLink>
        </Grid>
        <Grid item xs={input_width}>
          <form onSubmit={createNew}>
            <TextField
              id={"add_new"}
              type="url"
              value={url}
              onChange={(e) => setUrl(() => e.target.value)}
              placeholder="+"
              size="small"
              variant="standard"
            />
          </form>
        </Grid>
        <Grid item xs={input_width}>
          <form onSubmit={search}>
            <TextField
              id={"search"}
              type="text"
              value={query}
              onChange={(e) => setQuery(() => e.target.value)}
              placeholder="search"
              size="small"
              variant="standard"
            />
          </form>
        </Grid>
        <Grid item xs={blank_space} />
        <Grid item xs={button_width}>
          <Button
            id="basic-button"
            aria-controls={open ? "basic-menu" : undefined}
            aria-haspopup="true"
            aria-expanded={open ? "true" : undefined}
            onClick={handleClick}
          >
            <MenuIcon sx={{ fontSize: button_size }} />
          </Button>
          <Menu
            id="basic-menu"
            anchorEl={anchorEl}
            open={open}
            onClose={handleClose}
            MenuListProps={{
              "aria-labelledby": "basic-button",
            }}
          >
            <MenuItem>
              <MuiLink underline="none" component={Link} href="/liked">
                <FavoriteIcon sx={{ fontSize: button_size }} /> Liked
              </MuiLink>
            </MenuItem>
            <MenuItem>
              <MuiLink underline="none" component={Link} href="/archived">
                <ArchiveIcon sx={{ fontSize: button_size }} /> Archived
              </MuiLink>
            </MenuItem>
            <MenuItem>
              <MuiLink underline="none" href="#" onClick={toggleTheme}>
                {isLight ? (
                  <DarkModeIcon sx={{ fontSize: button_size }} />
                ) : (
                  <LightModeIcon sx={{ fontSize: button_size }} />
                )}{" "}
                Change theme
              </MuiLink>
            </MenuItem>
            <MenuItem>
              <MuiLink underline="none" href="#" onClick={() => signOut()}>
                <LogoutIcon sx={{ fontSize: button_size }} /> Log out
              </MuiLink>
            </MenuItem>
          </Menu>
        </Grid>
      </Grid>
    </>
  );
};
