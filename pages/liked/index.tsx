import useSWR, { Fetcher } from "swr";
import { ArticleData, ElementKind, WrappedData } from "../../types/types";
import ArticleElement from "../../components/ArticleElement";
import { Header } from "../../components/Header";

export const getServerSideProps = async () => {
  const res = await fetch("http://127.0.0.1:8000/articles/liked");
  const data = await res.json();
  return { props: { data } };
};

export default function Liked({ data }) {
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
