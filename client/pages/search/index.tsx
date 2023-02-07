import { WrappedData, ElementKind, ArticleData } from "../../types/types";
import { Header } from "../../components/Header";
import ArticleElement from "../../components/ArticleElement";
import { GetServerSideProps } from "next";
import { InferGetServerSidePropsType } from "next";

type Data = ArticleData[];

export const getServerSideProps: GetServerSideProps<{
  data: Data;
}> = async (context) => {
  const query = context.query.q;
  const target = "http://server:8000/search?q=" + query;
  const res = await fetch(target);
  const data = await res.json();
  return { props: { data } };
};

export default function Searched({
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
      <div className="count">RESULTS: {data.length}</div>
      {wrapped.map((e, index) => {
        return (
          <ArticleElement
            key={"searched-element" + { index }}
            element={e}
            kind={ElementKind.Searched}
          />
        );
      })}
    </>
  );
}
