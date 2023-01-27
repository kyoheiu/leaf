import useSWR, { Fetcher } from "swr";
import { ArticleData, ElementKind, WrappedData } from "../../types/types";
import ArticleElement from "../../components/ArticleElement";
import { Header } from "../../components/Header";

const fetcher: Fetcher<ArticleData[], string> = (url: string) =>
  fetch(url).then((res) => res.json());

export default function Home() {
  const { data, error } = useSWR(
    "http://localhost:8000/articles/liked",
    fetcher
  );

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
      {wrapped.map((e) => {
        return <ArticleElement element={e} kind={ElementKind.Liked} />;
      })}
    </>
  );
}
