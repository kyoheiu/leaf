import { ElementKind, WrappedData } from "../types/types";
import ArticleElement from "../components/ArticleElement";
import { Header } from "../components/Header";
import axios from "axios";

export const getServerSideProps = async () => {
  const res = await fetch("http://127.0.0.1:8000/articles");
  const data = await res.json();
  return { props: { data } };
};

export default function Home({ data }) {
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
        return <ArticleElement element={e} kind={ElementKind.Top} />;
      })}
    </>
  );
}
