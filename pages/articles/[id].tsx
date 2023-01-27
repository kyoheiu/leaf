import { ArticleContent } from "../../types/types";
import { Header } from "../../components/Header";
import ArticleElement from "../../components/ArticleElement";
import useSWR, { Fetcher } from "swr";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { GetServerSideProps } from "next";
import { InferGetServerSidePropsType } from "next";
import { cachedDataVersionTag } from "v8";
import sanitizeHtml from "sanitize-html";

type Data = ArticleContent;

export const getServerSideProps: GetServerSideProps<{
  data: Data;
}> = async (context) => {
  if (context.params) {
    const id = context.params.id;
    const target = "http://127.0.0.1:8000/articles/" + id;
    const res = await fetch(target);
    const data = await res.json();
    return { props: { data } };
  } else {
    return { props: { data: [] } };
  }
};

export default function Searched({
  data,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const [pos, setPos] = useState(0);
  const [prog, setProg] = useState(0);

  const getScrollPosition = () => {
    const bodyheight = document.documentElement.scrollHeight;
    const scrolled = document.documentElement.scrollTop;
    const client = document.documentElement.clientHeight;

    const new_pos = Math.round((scrolled * 100) / bodyheight);
    const new_prog = Math.abs(bodyheight - client - scrolled);
    if (prog < 1) {
      setPos(new_pos);
      setProg(100);
      return;
    } else {
      setPos(new_pos);
      setProg(100 - Math.round((new_prog * 100) / bodyheight));
    }
  };

  const fetch_pos = () => {
    const numbers = getScrollPosition();
    console.log("pos: " + pos + " prog: " + prog);
    const target =
      "http://localhost:8000/articles/" +
      data.id +
      "?pos=" +
      pos +
      "&prog=" +
      prog;
    fetch(target, { method: "POST" }).then((res) => {
      if (!res.ok) {
        console.error("Cannot update progress.");
      }
    });
  };

  useEffect(() => globalThis.addEventListener("scroll", fetch_pos), []);

  if (!data) {
    return <h1>No article found.</h1>;
  }

  const cleaned = sanitizeHtml(data.html);

  return (
    <>
      <div className="title">{data.title}</div>
      <div dangerouslySetInnerHTML={{ __html: cleaned }}></div>
    </>
  );
}
