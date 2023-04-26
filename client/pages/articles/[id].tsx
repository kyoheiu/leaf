import { Link as MuiLink, Toolbar } from "@mui/material";
import { ArticleContent } from "../../types/types";
import { useContext, useEffect, useState } from "react";
import { GetServerSideProps, InferGetServerSidePropsType } from "next";
import Button from "@mui/material/Button";
import Divider from "@mui/material/Divider";
import { RiHeart2Line, RiHeart2Fill, RiInboxArchiveLine, RiInboxUnarchiveFill, RiDeleteBin2Line } from "react-icons/ri";
import Link from "@mui/material/Link";
import { getArticleContent } from "../api/articles/[id]";
import Head from "next/head";
import Image from "next/image";
import { LOGO_SIZE } from "../../components/Header";
import AppBar from "@mui/material/AppBar";
import { ColorMode } from "../../context/ColorMode";
import Tags from "../../components/Tags";
import LinkButton from "../../components/LinkButton";

type Data = ArticleContent;

interface Update {
	pos: number,
	prog: number,
	updated: boolean
}

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
	const { isLight } = useContext(ColorMode);
	let currentPosition = 0;

	const [articleContent, setArticleContent] = useState<ArticleContent>(data);

	const getScrollPosition = (): Update => {
		const bodyheight = document.documentElement.scrollHeight;
		const scrolled = document.documentElement.scrollTop;
		const client = document.documentElement.clientHeight;
		const pos = Math.round((scrolled * 100) / bodyheight);
		const prog = Math.abs(bodyheight - client - scrolled);

		let updated = false;
		if (pos !== currentPosition) {
			console.debug(pos);
			console.debug(currentPosition);
			currentPosition = pos;
			updated = true;
		}

		if (prog < 1) {
			return { pos: pos, prog: 100, updated: updated };
		} else {
			return { pos: pos, prog: 100 - Math.round((prog * 100) / bodyheight), updated: updated };
		}
	};

	const saveScrollPos = () => {
		const updated = getScrollPosition();
		if (updated.pos !== 0 && updated.updated) {
			fetch(
				`/api/articles/${articleContent.id}?pos=${updated.pos}&prog=${updated.prog}`,
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
		const interval = setInterval(() => {
			saveScrollPos();
		}, 2000);

		return () => clearInterval(interval);
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

	if (!articleContent) {
		return <h1>No article found.</h1>;
	}

	// Already sanitized on server side
	const create_markup = () => {
		return { __html: articleContent.html };
	};

	const Buttons = ({ data }: { data: ArticleContent }) => {
		return (
			<>
				<LinkButton url={articleContent.url} />
				<Button onClick={toggleLiked} title="toggle liked">
					{data.liked ? (
						<RiHeart2Fill />
					) : (
						<RiHeart2Line />
					)}
				</Button>
				<Button onClick={toggleArchived} title="toggle archived">
					{data.archived ? (
						<RiInboxUnarchiveFill />
					) : (
						<RiInboxArchiveLine />
					)}
				</Button>
				<Button onClick={deleteArticleItself} title="delete">
					<RiDeleteBin2Line />
				</Button>
			</>
		);
	};

	return (
		<>
			<Head>
				<title>
					{articleContent.title} | {process.env.NEXT_PUBLIC_TITLE}
				</title>
			</Head>
			<AppBar elevation={0} position="fixed" color="default">
				<Toolbar variant="dense" sx={{ display: "flex" }}>
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
			<div className="article-content">
				<div dangerouslySetInnerHTML={create_markup()} />
			</div>
			<Divider className="article-divider" />
			<div className="article-tags">
				<Tags tags={articleContent.tags} id={articleContent.id} />
			</div>
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
	)
		;
}
