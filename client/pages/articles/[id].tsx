import { Link as MuiLink, Toolbar } from "@mui/material";
import { ArticleContent } from "../../types/types";
import { useContext, useEffect, useState } from "react";
import { GetServerSideProps, InferGetServerSidePropsType } from "next";
import Button from "@mui/material/Button";
import Divider from "@mui/material/Divider";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import FavoriteIcon from "@mui/icons-material/Favorite";
import ArchiveIcon from "@mui/icons-material/Archive";
import UnarchiveIcon from "@mui/icons-material/Unarchive";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import Login from "../../components/Login";
import { useSession } from "next-auth/react";
import Link from "@mui/material/Link";
import { getArticleContent } from "../api/articles/[id]";
import Head from "next/head";
import Image from "next/image";
import { LOGO_SIZE } from "../../components/Header";
import AppBar from "@mui/material/AppBar";
import Grid from "@mui/material/Grid";
import { ColorMode } from "../../context/ColorMode";
import LinkIcon from '@mui/icons-material/Link';
import toast from "react-simple-toasts";

type Data = ArticleContent;

export const getServerSideProps: GetServerSideProps<{
	data: Data;
}> = async (context) => {
	if (context.params) {
		const id = context.params.id;
		const data = await getArticleContent(id as string);
		return { props: { data } };
	} else {
		return { props: { data: [] } };
	}
};

export default function Article({
	data,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
	const { data: session, status } = useSession();
	const { isLight } = useContext(ColorMode);

	const [articleContent, setArticleContent] = useState<ArticleContent>(data);

	const getScrollPosition = () => {
		const bodyheight = document.documentElement.scrollHeight;
		const scrolled = document.documentElement.scrollTop;
		const client = document.documentElement.clientHeight;
		const pos = Math.round((scrolled * 100) / bodyheight);
		const prog = Math.abs(bodyheight - client - scrolled);
		if (prog < 1) {
			return { pos: pos, prog: 100 };
		} else {
			return { pos: pos, prog: 100 - Math.round((prog * 100) / bodyheight) };
		}
	};

	const saveScrollPos = () => {
		const n = getScrollPosition();
		if (n.pos !== 0) {
			fetch(
				`/api/articles/${articleContent.id}?pos=${n.pos}&prog=${n.prog}`,
				{
					method: "POST",
				},
			).then((res) => {
				if (!res.ok) {
					console.error("Cannot update progress.");
				}
			});
		}
	};

	const restoreScrollPos = () => {
		const scroll = Math.round(
			(document.documentElement.scrollHeight * articleContent.position) / 100,
		);
		console.log(articleContent.position);
		globalThis.scrollTo(0, scroll);
	};

	useEffect(() => {
		let mounted = true;
		if (mounted) {
			restoreScrollPos();
		}
		return () => { mounted = false };
	}, []);

	useEffect(() => {
		globalThis.addEventListener("scroll", saveScrollPos);
		return () => globalThis.removeEventListener("scroll", saveScrollPos);
	}, []);

	const toggleLiked = async () => {
		const res = await fetch(`/api/articles/${articleContent.id}?toggle=liked`, {
			method: "POST",
			body: articleContent.id,
		});
		if (!res.ok) {
			console.log("Cannot toggle like.");
		} else {
			setArticleContent((x) => ({
				...x,
				liked: !x.liked,
			}));
		}
	};

	const toggleArchived = async () => {
		const res = await fetch(
			`/api/articles/${articleContent.id}?toggle=archived`,
			{
				method: "POST",
				body: articleContent.id,
			},
		);
		if (!res.ok) {
			console.log("Cannot archive article.");
		} else {
			setArticleContent((x) => ({
				...x,
				archived: !x.archived,
			}));
		}
	};

	const deleteArticleItself = async () => {
		const res = await fetch(`/api/articles/${articleContent.id}`, {
			method: "DELETE",
		});
		if (!res.ok) {
			console.log("Cannot delete article.");
		} else {
			globalThis.location.href = "/";
		}
	};

	if (status === "loading") {
		return <div>Loading...</div>;
	}

	if (!articleContent) {
		return <h1>No article found.</h1>;
	}

	// Already sanitized on server side
	const create_markup = () => {
		return { __html: articleContent.html };
	};

	const copyToClipboard = async () => {
		await navigator.clipboard.writeText(articleContent.url);
		toast("URL copied to clipboard.");
	}

	const Buttons = ({ data }: { data: ArticleContent }) => {
		return (
			<>
				<Button onClick={copyToClipboard}>
					<LinkIcon sx={{ fontSize: 20 }} />
				</Button>
				<Button onClick={toggleLiked}>
					{data.liked ? (
						<FavoriteIcon sx={{ fontSize: 20 }} />
					) : (
						<FavoriteBorderIcon sx={{ fontSize: 20 }} />
					)}
				</Button>
				<Button onClick={toggleArchived}>
					{data.archived ? (
						<UnarchiveIcon sx={{ fontSize: 20 }} />
					) : (
						<ArchiveIcon sx={{ fontSize: 20 }} />
					)}
				</Button>
				<Button onClick={deleteArticleItself}>
					<DeleteForeverIcon sx={{ fontSize: 20 }} />
				</Button>
			</>
		);
	};

	const logo_width = 1;
	const button_width = 0.8;
	const input_width = 12 - logo_width - button_width * 2;
	const button_size = 18;

	return session ? (
		<>
			<Head>
				<title>
					{articleContent.title} | {process.env.NEXT_PUBLIC_TITLE}
				</title>
			</Head>
			<AppBar position="fixed" color="default">
				<Toolbar sx={{ display: "flex" }} variant="dense">
					<MuiLink
						className="site-title"
						component={Link}
						underline="none"
						href="/"
					>
						<Image
							src={isLight ? "/logo_light.png" : "/logo_dark.png"}
							alt="leaf"
							height={LOGO_SIZE}
							width={LOGO_SIZE}
						/>
					</MuiLink>
					<div style={{ marginLeft: "auto" }}>
						<Buttons data={articleContent} />
					</div>
				</Toolbar>
			</AppBar>
			<div className="article-title">{articleContent.title}</div>
			<div className="article-url">
				<Link href={articleContent.url}>{articleContent.url}</Link>
			</div>
			<Divider className="article-divider" />
			<div dangerouslySetInnerHTML={create_markup()} />
			<Divider className="article-divider" />
			<MuiLink
				className="site-title"
				component={Link}
				underline="none"
				href="/"
			>
				<Image
					src={isLight ? "/logo_light.png" : "/logo_dark.png"}
					alt="leaf"
					height={LOGO_SIZE}
					width={LOGO_SIZE}
				/>
			</MuiLink>
		</>
	) : (
		<Login />
	);
}
