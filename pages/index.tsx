import { ArticleData, ElementKind, WrappedData } from "../types/types";
import ArticleElement from "../components/ArticleElement";
import { Header } from "../components/Header";
import { GetServerSideProps } from "next";
import { InferGetServerSidePropsType } from "next";

type Data = ArticleData[];

export const getServerSideProps: GetServerSideProps<{
  data: Data;
}> = async () => {
  const res = await fetch("http://127.0.0.1:8000/articles");
  const data = await res.json();
  return { props: { data } };
};

export default function Home({
  data,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
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
      <li>
        {wrapped.map((e) => {
          return <ArticleElement element={e} kind={ElementKind.Top} />;
        })}
      </li>
    </>
  );
}
