import { ArticleContent } from "../../types/types";
import Link from "next/link";
import { useContext, useEffect, useState } from "react";
import { GetServerSideProps, InferGetServerSidePropsType } from "next";
import {
  RiHeart2Line,
  RiHeart2Fill,
  RiInboxArchiveLine,
  RiInboxUnarchiveFill,
  RiDeleteBin2Line,
} from "react-icons/ri";
import { getArticleContent } from "../api/articles/[id]";
import Head from "next/head";
import Image from "next/image";
import { LOGO_SIZE } from "@/components/Header";
import Tags from "@/components/Tags";
import LinkButton from "@/components/LinkButton";
import { ColorMode } from "../../context/ColorMode";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/auth";

type Data = ArticleContent;

interface Update {
  pos: number;
  prog: number;
  updated: boolean;
}

export const getServerSideProps: GetServerSideProps<{
  data: Data;
}> = async (context) => {
  if (process.env.GITHUB_CLIENT_ID) {
    const session = await getServerSession(
      context.req,
      context.res,
      authOptions
    );
    if (!session) {
      return {
        redirect: {
          destination: "/api/auth/signin",
          permanent: false,
        },
      };
    }
  }
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
      return {
        pos: pos,
        prog: 100 - Math.round((prog * 100) / bodyheight),
        updated: updated,
      };
    }
  };

  const saveScrollPos = () => {
    const updated = getScrollPosition();
    if (updated.pos !== 0 && updated.updated) {
      fetch(
        `/api/articles/${articleContent.id}?pos=${updated.pos}&prog=${updated.prog}`,
        {
          method: "POST",
        }
      ).then((res) => {
        if (!res.ok) {
          console.error("Cannot update progress.");
        }
      });
    }
  };

  const restoreScrollPos = () => {
    const scroll = Math.round(
      (document.documentElement.scrollHeight * articleContent.position) / 100
    );
    globalThis.scrollTo(0, scroll);
  };

  useEffect(() => {
    let mounted = true;
    if (mounted) {
      restoreScrollPos();
    }
    return () => {
      mounted = false;
    };
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
      console.error("Cannot toggle like.");
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
      }
    );
    if (!res.ok) {
      console.error("Cannot archive article.");
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
      console.error("Cannot delete article.");
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
      <div className="flex">
        <LinkButton url={articleContent.url} />
        <button className="px-2" onClick={toggleLiked} title="toggle liked">
          {data.liked ? <RiHeart2Fill /> : <RiHeart2Line />}
        </button>
        <button
          className="px-2"
          onClick={toggleArchived}
          title="toggle archived"
        >
          {data.archived ? <RiInboxUnarchiveFill /> : <RiInboxArchiveLine />}
        </button>
        <button className="px-2" onClick={deleteArticleItself} title="delete">
          <RiDeleteBin2Line />
        </button>
      </div>
    );
  };

  return (
    <>
      <Head>
        <title>
          {articleContent.title} | {process.env.NEXT_PUBLIC_TITLE}
        </title>
      </Head>
      <div className="flex items-center bg-zinc-900 sticky top-0 my-3">
        <Link href="/">
          <Image src={"/logo_dark.png"} alt="leaf" height={30} width={30} />
        </Link>
        <div className="ml-auto">
          <Buttons data={articleContent} />
        </div>
      </div>
      <div className="text-lg text-center w-2/3 m-auto">
        {articleContent.title}
      </div>
      <div className="text-sm text-zinc-400 line-clamp-1 my-3 w-2/3 m-auto">
        <Link href={articleContent.url}>{articleContent.url}</Link>
      </div>
      <hr className="border-2 rounded-md my-5" />
      <div className="mb-6">
        <div dangerouslySetInnerHTML={create_markup()} />
      </div>
      <hr className="border-2 rounded-md my-5" />
      <div className="article-tags">
        <Tags tags={articleContent.tags} id={articleContent.id} />
      </div>
      <div className="flex justify-center">
        <Link href="/">
          <Image src={"/logo_dark.png"} alt="leaf" height={30} width={30} />
        </Link>
      </div>
    </>
  );
}
