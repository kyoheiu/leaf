import { ElementProps, ElementKind } from "../types/types";
import { useState } from "react";
import Tags from "./Tags";
import Link from "next/link";
import { Button, Container } from "@mui/material";
import { CircularProgress } from "@mui/material";
import { Input } from "@mui/material";
import { Avatar } from "@mui/material";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import FavoriteIcon from "@mui/icons-material/Favorite";
import ArchiveIcon from "@mui/icons-material/Archive";
import UnarchiveIcon from "@mui/icons-material/Unarchive";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import LabelIcon from "@mui/icons-material/Label";
import LabelOffIcon from "@mui/icons-material/LabelOff";

export default function ArticleElement(props: ElementProps) {
  const [article, setArticle] = useState(props.element);

  const kind = props.kind;

  const toggle_like = async () => {
    const target =
      "http://localhost:8000/articles/" + article.data.id + "?toggle=liked";
    const res = await fetch(target, { method: "POST" });
    if (!res.ok) {
      console.log("Cannot toggle like.");
    }

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
  };

  const archive = async () => {
    const target =
      "http://localhost:8000/articles/" + article.data.id + "?toggle=archived";
    const res = await fetch(target, { method: "POST" });
    if (!res.ok) {
      console.log("Cannot archive article.");
    }

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
  };

  const delete_article = async () => {
    const target = "http://localhost:8000/articles/" + article.data.id;
    const res = await fetch(target, { method: "DELETE" });
    if (!res.ok) {
      console.log("Cannot delete article.");
    }
    setArticle((x) => ({
      ...x,
      visible: false,
    }));
  };

  const add_tag = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    const element = document.getElementById(article.data.id + "_add_tag");
    const tag = (element as HTMLInputElement).value;
    console.log(tag);
    const target =
      "http://localhost:8000/articles/" + article.data.id + "?kind=add";
    const res = await fetch(target, {
      method: "POST",
      body: tag,
    });
    if (!res.ok) {
      console.log("Cannot add tag.");
    }
    setArticle((x) => ({
      ...x,
      data: {
        ...x.data,
        tags: [...x.data.tags, tag.toLowerCase()],
      },
    }));
    (element as HTMLInputElement).value = "";
  };

  const delete_tag = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    const tag = document.getElementById(
      article.data.id + "_delete_tag"
    )!.innerHTML;
    console.log(tag);
    const target =
      "http://localhost:8000/articles/" + article.data.id + "?kind=delete";
    const res = await fetch(target, {
      method: "POST",
      body: tag,
    });
    if (!res.ok) {
      console.log("Cannot delete tag.");
    }
    const updated = article.data.tags.filter((x) => x !== tag);
    setArticle((x) => ({
      ...x,
      data: {
        ...x.data,
        tags: updated,
      },
    }));
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
    <>
      <div key={article.data.id} id={article.data.id}>
        <div className="timestamp">{article.data.timestamp}</div>
        <div className="title">
          <a href={"/articles/" + article.data.id}>{article.data.title}</a>
        </div>
        <div className="beginning">{article.data.beginning}</div>
        <div>
          {article.data.og !== "" && (
            <Avatar
              className="og"
              sx={{ width: 100, height: 100 }}
              variant="rounded"
              src={article.data.og}
            />
          )}
        </div>
        <CircularProgress variant="determinate" value={article.data.progress} />
        <Button id={article.data.id} onClick={toggle_like}>
          {article.data.liked ? <FavoriteIcon /> : <FavoriteBorderIcon />}
        </Button>
        <Button id={article.data.id} onClick={archive}>
          {article.data.archived ? <UnarchiveIcon /> : <ArchiveIcon />}
        </Button>
        <Button id={article.data.id} onClick={delete_article}>
          <DeleteForeverIcon />
        </Button>
        <div>
          {article.data.tags.map((x, index) => {
            {
              return (
                <div key={index}>
                  <form>
                    <Link href={"/tags/" + x}>
                      <code id={article.data.id + "_delete_tag"}>{x}</code>
                    </Link>
                    <Button onClick={(e) => delete_tag(e)}>
                      <LabelOffIcon />
                    </Button>
                    &nbsp;
                  </form>
                </div>
              );
            }
          })}
        </div>
        <Tags tags={article.data.tags} />
        <form>
          <Input id={article.data.id + "_add_tag"} type="text" />
          <Button onClick={(e) => add_tag(e)}>
            <LabelIcon />
          </Button>
        </form>
      </div>
    </>
  );
}
