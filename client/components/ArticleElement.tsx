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
    <div key={article.data.id} id={article.data.id} className="mb-8">
      <div className="text-sm text-gray-400 py-1">
        {article.data.timestamp.substring(0, article.data.timestamp.length - 3)}
      </div>
      <div className="text-sky-300 text-lg font-semibold leading-6 line-clamp-3">
        <a href={`/articles/${article.data.id}`} className="no-underline">{article.data.title}</a>
      </div>
      <div className="flex items-center text-sm text-gray-400 my-2">
        <a href={article.data.url} target="_blank">
          {trimUrl(article.data.url)}
        </a>
        &nbsp;
        <LinkButton url={article.data.url} />
      </div>
      <div className="grid grid-cols-10 gap-3 mt-1 mb-2 mx-auto">
        {article.data.cover !== "" ? (
          <>
            <div className="col-span-7 text-sm line-clamp-4">
              {article.data.beginning}
            </div>
            <div className="col-span-3">
              <img
                loading="lazy"
                className="object-contain h-16"
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
        <div className="h-1 w-full bg-gray-600 rounded-md">
          <div
            className="h-1 bg-gray-200 rounded-md"
            style={{ width: `${article.data.progress}%` }}
          ></div>
        </div>
        <button
          className="text-sm px-2 border rounded-full mx-1"
          onClick={() => toggleLiked(article.data.id)}
          title="toggle liked"
        >
          {article.data.liked ? <RiHeart2Fill /> : <RiHeart2Line />}
        </button>
        <button
          className="text-sm px-2 border rounded-full mx-1"
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
          className="text-sm px-2 border rounded-full ml-1"
          onClick={() => deleteArticleContent(article.data.id)}
          title="delete"
        >
          <RiDeleteBin2Line />
        </button>
      </div>
    </div>
  );
}
