import { WrappedData, ElementKind, ArticleData } from "../../types/types";
import { Header } from "../../components/Header";
import ArticleElement from "../../components/ArticleElement";
import { GetServerSideProps } from "next";
import { InferGetServerSidePropsType } from "next";
import Login from "../../components/Login";
import { useSession } from "next-auth/react";
import { searchArticles } from "../api/search";
import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]";
import Stack from "@mui/material/Stack";

type Data = ArticleData[];

export const getServerSideProps: GetServerSideProps<{
  data: Data;
}> = async (context) => {
  const session = await getServerSession(context.req, context.res, authOptions);
  if (!session) {
    return {
      redirect: {
        destination: "/",
        permanent: false,
      },
    };
  } else {
    const data = await searchArticles(context.query.q!);
    return { props: { data } };
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
      <Stack className="articles-list" spacing={5}>
        <div className="count">RESULTS: {data.length}</div>
        {wrapped.map((e, index) => {
          return (
            <ArticleElement
              key={`searched-element${{ index }}`}
              element={e}
              kind={ElementKind.Searched}
            />
          );
        })}
      </Stack>
    </>
  ) : (
    <Login />
  );
}
