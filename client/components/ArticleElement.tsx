import { ElementProps, ElementKind } from "../types/types";
import { useState } from "react";
import Tags from "./Tags";
import Link from "next/link";
import {
  RiHeart2Line,
  RiHeart2Fill,
  RiInboxArchiveLine,
  RiInboxUnarchiveFill,
  RiDeleteBin2Line,
} from "react-icons/ri";
import LinkButton from "@/components/LinkButton";

export default function ArticleElement(props: ElementProps) {
  const [article, setArticle] = useState(props.element);
  const kind = props.kind;

  const trimUrl = (url: string) => {
    return url.split("/").slice(2, 3).join("/");
  };

  const toggleLiked = async (id: string) => {
    const res = await fetch(`/api/articles/${id}?toggle=liked`, {
      method: "POST",
    });
    if (!res.ok) {
      console.error("Cannot toggle like.");
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
      console.error("Cannot archive article.");
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
      console.error("Cannot delete article.");
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
      <div className="text-slate-200">
        {article.data.timestamp.substring(0, article.data.timestamp.length - 3)}
      </div>
      <div className="text-xl">
        <a href={`/articles/${article.data.id}`}>{article.data.title}</a>
      </div>
      <div className="element-url">
        {trimUrl(article.data.url)}
        <LinkButton url={article.data.url} />
      </div>
      <div>
        <div>
          <div className="element-beginning">{article.data.beginning}</div>
        </div>
        <div>
          {article.data.cover !== "" && (
            <img className="og" src={article.data.cover} />
          )}
        </div>
      </div>
      <div>
        <div>
          <Tags tags={article.data.tags} id={article.data.id} />
        </div>
      </div>
      <button onClick={() => toggleLiked(article.data.id)} title="toggle liked">
        {article.data.liked ? <RiHeart2Fill /> : <RiHeart2Line />}
      </button>
      <button
        onClick={() => toggleArchived(article.data.id)}
        title="toggle archived"
      >
        {article.data.archived ? (
          <RiInboxUnarchiveFill />
        ) : (
          <RiInboxArchiveLine />
        )}
      </button>
      <button
        onClick={() => deleteArticleContent(article.data.id)}
        title="delete"
      >
        <RiDeleteBin2Line />
      </button>
    </div>
  );
}
