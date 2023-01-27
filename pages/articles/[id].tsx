import {
  WrappedData,
  ElementKind,
  ArticleData,
  ArticleContent,
} from "../../types/types";
import { Header } from "../../components/Header";
import ArticleElement from "../../components/ArticleElement";
import useSWR, { Fetcher } from "swr";
import { useReducer } from "react";
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
