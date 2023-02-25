import Link from "next/link";
import { useContext, useState } from "react";
import TextField from "@mui/material/TextField";
import { Link as MuiLink } from "@mui/material";
import Grid from "@mui/material/Grid";
import FavoriteIcon from "@mui/icons-material/Favorite";
import ArchiveIcon from "@mui/icons-material/Archive";
import LightModeIcon from "@mui/icons-material/LightMode";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import LogoutIcon from "@mui/icons-material/Logout";
import { ColorMode } from "../context/ColorMode";
import Image from "next/image";
import { useRouter } from "next/router";
import { signOut } from "next-auth/react";

export const Header = () => {
  const router = useRouter();

  const logo_width = 1.5;
  const button_width = 0.8;
  const input_width = (12 - logo_width - button_width * 4) / 2;
  const logo_size = 28;
  const button_size = 18;

  const [url, setUrl] = useState<string>("");
  const [query, setQuery] = useState<string>("");
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

  const createNew = async (e) => {
    e.preventDefault();
    console.log(url);
    const res = await fetch("/api/articles", {
      method: "POST",
      body: url,
    });
    if (!res.ok) {
      console.log("Cannot create new article.");
    } else {
      router.push("/");
      router.reload();
    }
  };

  const search = async (e) => {
    const split = query
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
        <Grid item xs={button_width}>
          <MuiLink component={Link} href="/liked">
            <FavoriteIcon sx={{ fontSize: button_size }} />
          </MuiLink>
        </Grid>
        <Grid item xs={button_width}>
          <MuiLink component={Link} href="/archived">
            <ArchiveIcon sx={{ fontSize: button_size }} />
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
