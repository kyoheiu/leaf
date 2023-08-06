import { ElementProps, ElementKind } from "../types/types";
import { useState } from "react";
import Tags from "./Tags";
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
        const el = document.getElementById(id);
        if (el) {
          el.classList.add("animate-out", "zoom-out", "duration-150");
        }
        setTimeout(() => {
        setArticle((x) => ({
          visible: false,
          data: {
            ...x.data,
            liked: !x.data.liked,
          },
        }));
        }, 150);
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
        const el = document.getElementById(id);
        if (el) {
          el.classList.add("animate-out", "zoom-out", "duration-150");
        }
        setTimeout(() => {
          setArticle((x) => ({
            visible: false,
            data: {
              ...x.data,
              archived: !x.data.archived,
            },
          }));
        }, 150);
      } else {
        const el = document.getElementById(id);
        if (el) {
          el.classList.add("animate-out", "zoom-out", "duration-150");
        }
        setTimeout(() => {
          setArticle((x) => ({
            visible: x.visible,
            data: {
              ...x.data,
              archived: !x.data.archived,
            },
          }));
        }, 150);
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
      const el = document.getElementById(id);
      if (el) {
        el.classList.add("animate-out", "zoom-out", "duration-150");
      }
      setTimeout(() => {
        setArticle((x) => ({
          ...x,
          visible: false,
        }));
      }, 150);
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
    <div key={article.data.id} id={article.data.id} className="mb-8">
      <div className="py-1 text-sm text-slate-500">
        {article.data.timestamp.substring(0, article.data.timestamp.length - 3)}
      </div>
      <div className="line-clamp-3 text-lg font-semibold leading-6">
        <a href={`/articles/${article.data.id}`} className="no-underline">
          {article.data.title}
        </a>
      </div>
      <div className="my-2 flex items-center text-sm text-slate-500">
        <a href={article.data.url} target="_blank">
          {trimUrl(article.data.url)}
        </a>
        &nbsp;
        <LinkButton url={article.data.url} />
      </div>
      <div className="mx-auto mb-2 mt-1 grid grid-cols-10 gap-3">
        {article.data.cover !== "" ? (
          <>
            <div className="col-span-7 line-clamp-4 text-sm">
              {article.data.beginning}
            </div>
            <div className="col-span-3">
              <img
                loading="lazy"
                className="h-16 object-contain"
                alt="cover"
                src={article.data.cover}
              />
            </div>
          </>
        ) : (
          <div className="col-span-10 text-sm">{article.data.beginning}</div>
        )}
      </div>
      <div>
        <div>
          <Tags tags={article.data.tags} id={article.data.id} />
        </div>
      </div>
      <div className="flex items-center">
        <div className="h-1 w-full rounded-md bg-slate-300">
          <div
            className="h-1 rounded-md bg-slate-500"
            style={{ width: `${article.data.progress}%` }}
          ></div>
        </div>
        <button
          id={`like-button-${article.data.id}`}
          className="mx-1 rounded-full border px-2 text-sm"
          onClick={() => toggleLiked(article.data.id)}
          title="toggle liked"
        >
          {article.data.liked ? (
            <RiHeart2Fill className="text-red-400" />
          ) : (
            <RiHeart2Line />
          )}
        </button>
        <button
          className="mx-1 rounded-full border px-2 text-sm"
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
          className="ml-1 rounded-full border px-2 text-sm"
          onClick={() => deleteArticleContent(article.data.id)}
          title="delete"
        >
          <RiDeleteBin2Line />
        </button>
      </div>
    </div>
  );
}
