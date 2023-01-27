import { WrappedData, ElementKind, ArticleData } from "../../types/types";
import { Header } from "../../components/Header";
import ArticleElement from "../../components/ArticleElement";
import useSWR, { Fetcher } from "swr";
import { useReducer } from "react";
import { useRouter } from "next/router";

const fetcher: Fetcher<ArticleData[], string> = (url: string) =>
  fetch(url).then((res) => res.json());

export default function Searched() {
  const router = useRouter();
  const query = router.query.q;
  const target = "http://localhost:8000/search?q=" + query;
  const { data, error } = useSWR(target, fetcher);

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
      <div className="count">
        QUERY: {query}, RESULTS: {data.length}
      </div>
      {wrapped.map((e) => {
        return <ArticleElement element={e} kind={ElementKind.Searched} />;
      })}
    </>
  );
}
