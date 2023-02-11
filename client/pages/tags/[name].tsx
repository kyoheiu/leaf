import { WrappedData, ElementKind, ArticleData } from "../../types/types";
import { Header } from "../../components/Header";
import ArticleElement from "../../components/ArticleElement";
import { GetServerSideProps } from "next";
import { InferGetServerSidePropsType } from "next";
import Login from "../../components/Login";
import { useSession } from "next-auth/react";

type Data = ArticleData[];

export const getServerSideProps: GetServerSideProps<{
  data: Data;
}> = async (context) => {
  if (context.params) {
    const tag_name = context.params.name;
    const target = `http://${process.env.HOST}:8000/tags/` + tag_name;
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
  const { data: session } = useSession();

  if (!data) {
    return <h1>No article found.</h1>;
  }

  const wrapped: WrappedData[] = data!.map((x) => ({
    visible: true,
    data: x,
  }))!;

  return session ? (
    <>
      <Header />
      <div className="count">RESULTS: {data.length}</div>
      {wrapped.map((e, index) => {
        return (
          <ArticleElement
            key={"tag-element" + { index }}
            element={e}
            kind={ElementKind.Searched}
          />
        );
      })}
    </>
  ) : (
    <Login />
  );
}
