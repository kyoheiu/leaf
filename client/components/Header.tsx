import Link from "next/link";
import { useContext, useState } from "react";
import {
  RiHeart2Line,
  RiInboxArchiveLine,
  RiSearch2Line,
  RiCloseLine,
  RiHome2Line,
  RiSunLine,
  RiMoonLine,
  RiLogoutBoxLine,
  RiMenuLine,
  RiDownload2Fill,
} from "react-icons/ri";
import { ColorMode } from "../context/ColorMode";
import Image from "next/image";
import { useRouter } from "next/router";
import { signOut } from "next-auth/react";
import Head from "next/head";
import toast from "react-simple-toasts";

export const LOGO_SIZE = 42;

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

  const [searchOpen, setSearchOpen] = useState(false);
  const handleClickSearchOpen = () => {
    setSearchOpen(true);
  };
  const handleSearchClose = () => {
    setSearchOpen(false);
  };
  const searchAndClose = async () => {
    const queries = (document.getElementById("search") as HTMLInputElement)
      .value;
    const split = queries
      .split(/(\s+)/)
      .filter((x) => x.trim().length > 0)
      .join("+");
    router.push(`/search?q=${split}`);
  };

  const [url, setUrl] = useState<string>("");
  const [progress, setProgress] = useState(false);
  const { isLight, setIsLight } = useContext(ColorMode);

  const toggleTheme = () => {
    setIsLight(() => {
      globalThis.sessionStorage.setItem(
        "leafTheme",
        isLight ? "dark" : "light"
      );
      return !isLight;
    });
  };

  const createNew = async (e: React.FormEvent) => {
    e.preventDefault();
    setProgress(true);
    console.debug(url);
    const res = await fetch("/api/articles", {
      method: "POST",
      body: url,
    });
    setProgress(false);
    if (!res.ok) {
      toast(res.statusText);
    } else {
      router.reload();
    }
  };

  const BarSearch = () => {
    return (
      <>
        <button
          className="ml-auto"
          onClick={handleClickSearchOpen}
          title="search"
        >
          <RiSearch2Line />
        </button>
      </>
    );
  };

  return (
    <>
      <Head>
        <title>{process.env.NEXT_PUBLIC_TITLE}</title>
      </Head>
      <div className="flex flex-nowrap items-center justify-between">
        <a href="/">
          <Image
            src="/logo_dark.png"
            alt="leaf"
            height={LOGO_SIZE}
            width={LOGO_SIZE}
          />
        </a>
        <form onSubmit={createNew}>
          &nbsp;
          <div>
            <input
              className="flex-auto rounded-md p-1 w-3/4 mb-5"
              id={"add_new"}
              type="url"
              value={url}
              onChange={(e) => setUrl(() => e.target.value)}
              placeholder="Add URL"
            />
          </div>
        </form>
        <BarSearch />
        &nbsp; &nbsp;
        <button className="" id="basic-button" onClick={(e) => handleClick(e)}>
          <RiMenuLine />
        </button>
        {/* <Menu
              id="basic-menu"
              anchorEl={anchorEl}
              open={open}
              onClose={handleClose}
              MenuListProps={{
                "aria-labelledby": "basic-button",
              }}
            >
              <MenuItem>
                <MuiLink underline="none" component={Link} href="/">
                  <RiHome2Line /> Top
                </MuiLink>
              </MenuItem>
              <MenuItem>
                <MuiLink underline="none" component={Link} href="/liked">
                  <RiHeart2Line /> Liked
                </MuiLink>
              </MenuItem>
              <MenuItem>
                <MuiLink underline="none" component={Link} href="/archived">
                  <RiInboxArchiveLine /> Archived
                </MuiLink>
              </MenuItem>
              <MenuItem>
                <MuiLink underline="none" href="#" onClick={toggleTheme}>
                  {isLight ? <RiMoonLine /> : <RiSunLine />} Change theme
                </MuiLink>
              </MenuItem>
              <MenuItem>
                <MuiLink underline="none" component={Link} href="/api/download">
                  <RiDownload2Fill /> Download data
                </MuiLink>
              </MenuItem>
              <MenuItem>
                <MuiLink underline="none" href="#" onClick={() => signOut()}>
                  <RiLogoutBoxLine /> Log out
                </MuiLink>
              </MenuItem>
            </Menu> */}
      </div>
    </>
  );
};
