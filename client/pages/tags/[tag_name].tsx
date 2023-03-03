import { WrappedData, ElementKind, ArticleData } from "../../types/types";
import { Header } from "../../components/Header";
import ArticleElement from "../../components/ArticleElement";
import { GetServerSideProps } from "next";
import { InferGetServerSidePropsType } from "next";
import Login from "../../components/Login";
import { useSession } from "next-auth/react";
import { getTagList } from "../api/tags/[tag_name]";
import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]";

type Data = ArticleData[];

export const getServerSideProps: GetServerSideProps<{
  data: Data;
}> = async (context) => {
  const session = await getServerSession(context.req, context.res, authOptions);
  if (!session) {
    return {
      notFound: true,
    };
  } else {
    if (context.params) {
      const data = await getTagList(context.params.tag_name as string);
      return { props: { data } };
    } else {
      return { props: { data: [] } };
    }
  }
};

export default function Searched({
  data,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return <div>Loading...</div>;
  }

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
            key={`tag-element${{ index }}`}
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
