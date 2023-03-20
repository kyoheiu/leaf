import Link from "next/link";
import { useContext, useState } from "react";
import TextField from "@mui/material/TextField";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import { Link as MuiLink } from "@mui/material";
import Button from "@mui/material/Button";
import Backdrop from "@mui/material/Backdrop";
import CircularProgress from "@mui/material/CircularProgress";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Grid from "@mui/material/Grid";
import SearchIcon from "@mui/icons-material/Search";
import CloseIcon from "@mui/icons-material/Close";
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

export const LOGO_SIZE = 42;

export const Header = () => {
	const router = useRouter();

	const logo_width = 1;
	const button_width = 0.8;
	const input_width = 12 - logo_width - button_width * 2;
	const button_size = 18;

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
				"hmstrTheme",
				isLight ? "dark" : "light",
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
			router.reload();
		}
	};

	return (
		<>
			<Head>
				<title>{process.env.NEXT_PUBLIC_TITLE}</title>
			</Head>
			<Backdrop open={progress}>
				<CircularProgress />
			</Backdrop>
			<Grid container textAlign="center" spacing={1} className="header">
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
							height={LOGO_SIZE}
							width={LOGO_SIZE}
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
							placeholder="Add URL"
							size="small"
							fullWidth
							variant="standard"
						/>
					</form>
				</Grid>
				<Grid item xs={button_width}>
					<MuiLink href="#" onClick={handleClickSearchOpen}>
						<SearchIcon sx={{ fontSize: button_size }} />
					</MuiLink>
					<Dialog open={searchOpen} onClose={handleSearchClose}>
						<DialogTitle>Search.</DialogTitle>
						<DialogContent>
							<TextField
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
