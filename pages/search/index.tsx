import { WrappedData, ElementKind, ArticleData } from "../../types/types";
import { Header } from "../../components/Header";
import ArticleElement from "../../components/ArticleElement";
import useSWR, { Fetcher } from "swr";
import { useReducer } from "react";
import { useRouter } from "next/router";

const fetcher: Fetcher<ArticleData[], string> = (url: string) =>
  fetch(url).then((res) => res.json());

export const getServerSideProps = async (context) => {
  const query = context.query.q;
  const target = "http://127.0.0.1:8000/search?q=" + query;
  const res = await fetch(target);
  const data = await res.json();
  return { props: { data } };
};

export default function Searched({ data }) {
  if (!data) {
    return <h1>No article found.</h1>;
  }

  const wrapped: WrappedData[] = data!.map((x) => ({
    visible: true,
    data: x,
  }))!;

  return (
    <>
      <Header />
      <div className="count">RESULTS: {data.length}</div>
      {wrapped.map((e) => {
        return <ArticleElement element={e} kind={ElementKind.Searched} />;
      })}
    </>
  );
}
