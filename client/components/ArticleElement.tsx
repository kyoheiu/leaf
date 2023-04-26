import { ElementProps, ElementKind } from "../types/types";
import { useState } from "react";
import Tags from "./Tags";
import Link from "next/link";
import { Link as MuiLink } from "@mui/material";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Grid from "@mui/material/Grid";
import LinearProgress from "@mui/material/LinearProgress";
import Avatar from "@mui/material/Avatar";
import { RiHeart2Line, RiHeart2Fill, RiInboxArchiveLine, RiInboxUnarchiveFill, RiDeleteBin2Line } from "react-icons/ri";
import LinkButton from "../components/LinkButton";

export default function ArticleElement(props: ElementProps) {
	const [article, setArticle] = useState(props.element);
	const kind = props.kind;

	const trimUrl = (url: string) => {
		return url.split("/").slice(2, 3).join("/");
	}

	const toggleLiked = async (id: string) => {
		const res = await fetch(`/api/articles/${id}?toggle=liked`, {
			method: "POST",
		});
		if (!res.ok) {
			console.log("Cannot toggle like.");
		} else {
			if (kind === ElementKind.Liked) {
				setArticle((x) => ({
					visible: false,
					data: {
						...x.data,
						liked: !x.data.liked,
					},
				}));
			} else {
				setArticle((x) => ({
					visible: x.visible,
					data: {
						...x.data,
						liked: !x.data.liked,
					},
				}));
			}
		}
	};

	const toggleArchived = async (id: string) => {
		const res = await fetch(`/api/articles/${id}?toggle=archived`, {
			method: "POST",
		});
		if (!res.ok) {
			console.log("Cannot archive article.");
		} else {
			if (kind === ElementKind.Archived) {
				setArticle((x) => ({
					visible: false,
					data: {
						...x.data,
						archived: !x.data.archived,
					},
				}));
			} else {
				setArticle((x) => ({
					visible: x.visible,
					data: {
						...x.data,
						archived: !x.data.archived,
					},
				}));
			}
		}
	};

	const deleteArticleContent = async (id: string) => {
		const res = await fetch(`/api/articles/${id}`, {
			method: "DELETE",
		});
		if (!res.ok) {
			console.log("Cannot delete article.");
		} else {
			setArticle((x) => ({
				...x,
				visible: false,
			}));
		}
	};

	if ((kind === ElementKind.Top && article.data.archived) || !article.visible) {
		return <></>;
	}

	if (
		(kind === ElementKind.Archived ||
			kind === ElementKind.Liked ||
			kind === ElementKind.Searched) &&
		!article.visible
	) {
		return <></>;
	}

	return (
		<div key={article.data.id} id={article.data.id}>
			<div className="element-timestamp">
				{article.data.timestamp.substring(0, article.data.timestamp.length - 3)}
			</div>
			<div className="element-title">
				<MuiLink
					component={Link}
					color="primary"
					underline="hover"
					href={`/articles/${article.data.id}`}
					scroll={false}
				>
					{article.data.title}
				</MuiLink>
			</div>
			<div className="element-url">
				{trimUrl(article.data.url)}
				<LinkButton url={article.data.url} />
			</div>
			<Grid container spacing={2}>
				<Grid item xs={9}>
					<Typography className="element-beginning">{article.data.beginning}</Typography>
				</Grid>
				<Grid item xs={3}>
					{article.data.cover !== "" && (
						<Avatar
							className="og"
							sx={{ width: 1, height: 90 }}
							variant="rounded"
							src={article.data.cover}
						/>
					)}
				</Grid>
			</Grid>
			<Grid container>
				<Grid item xs={9}>
					<Tags tags={article.data.tags} id={article.data.id} />
				</Grid>
			</Grid>
			<LinearProgress
				variant="determinate"
				sx={{ width: 3 / 4 }}
				value={article.data.progress}
			/>
			<div>
				<Button onClick={() => toggleLiked(article.data.id)} title="toggle liked">
					{article.data.liked ? (
						<RiHeart2Fill />
					) : (
						<RiHeart2Line />
					)}
				</Button>
				<Button onClick={() => toggleArchived(article.data.id)} title="toggle archived">
					{article.data.archived ? (
						<RiInboxUnarchiveFill />
					) : (
						<RiInboxArchiveLine />
					)}
				</Button>
				<Button onClick={() => deleteArticleContent(article.data.id)} title="delete">
					<RiDeleteBin2Line />

				</Button>
			</div>
		</div>
	);
}
