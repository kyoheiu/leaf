import { ArticleContent } from "../../types/types";
import { useEffect, useState } from "react";
import { GetServerSideProps } from "next";
import { InferGetServerSidePropsType } from "next";
import Router, { useRouter } from "next/router";
import { Divider, Typography } from "@mui/material";

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

export default function Article({
  data,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const router = useRouter();

  const [shouldSaveScroll, setShouldSaveScroll] = useState(true);

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
    if (shouldSaveScroll) {
      const n = getScrollPosition();
      if (n.pos !== 0) {
        console.log("pos: " + n.pos + " prog: " + n.prog);
        const target =
          "http://localhost:8000/articles/" +
          data.id +
          "?pos=" +
          n.pos +
          "&prog=" +
          n.prog;
        fetch(target, { method: "POST" }).then((res) => {
          if (!res.ok) {
            console.error("Cannot update progress.");
          }
        });
      }
    }
  };

  const restoreScrollPos = () => {
    const scroll = Math.round(
      (document.documentElement.scrollHeight * data.position) / 100
    );
    console.log(data.position);
    globalThis.scrollTo(0, scroll);
  };

  useEffect(() => {
    restoreScrollPos();
  }, []);

  useEffect(() => globalThis.addEventListener("scroll", saveScrollPos), []);

  useEffect(() => {
    const setSaveOff = () => {
      setShouldSaveScroll((_v) => false);
    };
    router.beforePopState(({}) => {
      setShouldSaveScroll(() => false);
      console.log(shouldSaveScroll);
      return true;
    });
    router.events.on("routeChangeStart", setSaveOff);
    return () => {
      router.events.off("routeChangeStart", setSaveOff);
    };
  }, []);

  if (!data) {
    return <h1>No article found.</h1>;
  }

  const create_markup = () => {
    return { __html: data.html };
  };

  return (
    <>
      <div className="article-title">{data.title}</div>
      <div className="article-url">{data.url}</div>
      <Divider className="article-divider" />
      <div dangerouslySetInnerHTML={create_markup()}></div>
      <Divider className="article-divider" />
      <Typography className="ending" color="secondary">
        End of this article.
      </Typography>
    </>
  );
}
