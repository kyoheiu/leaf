import { ArticleData, ElementKind, WrappedData } from "../../types/types";
import ArticleElement from "../../components/ArticleElement";
import { Header } from "../../components/Header";
import Footer from "../../components/Footer";
import { GetServerSideProps } from "next";
import { InferGetServerSidePropsType } from "next";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Login from "../../components/Login";
import Stack from "@mui/material/Stack";
import {
  getArchivedArticles,
  reloadArchivedArticles,
} from "../api/articles/archived";
import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]";
import useBottomEffect from "../../hooks/useBottomEffect";

type Data = ArticleData[];

export const getServerSideProps: GetServerSideProps<{
  data: Data;
}> = async (context) => {
  const session = await getServerSession(context.req, context.res, authOptions);
  if (!session) {
    return {
      redirect: {
        destination: "/login",
        permanent: false,
      },
    };
  } else {
    const data = await getArchivedArticles();
    return { props: { data } };
  }
};

export default function Archived({
  data,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const { data: session, status } = useSession();

  const [list, setList] = useState<ArticleData[]>(data);
  const [isBottom, setIsBottom] = useState(false);
  const [isLast, setIsLast] = useState(false);

  useBottomEffect(setIsBottom);

  useEffect(() => {
    if (isBottom) {
      reloadArchivedArticles(list.slice(-1)[0].id).then((j: ArticleData[]) => {
        if (j.length === 0) {
          setIsLast(true);
        } else {
          setList((arr) => arr.concat(j));
        }
      });
      setIsBottom(false);
    }
  });

  if (status === "loading") {
    return <div>Loading...</div>;
  }

  if (!data) {
    return <h1>No article found.</h1>;
  }

  const wrapped: WrappedData[] = list.map((x) => ({
    visible: true,
    data: x,
  }))!;

  return session ? (
    <>
      <Header />
      <Stack className="articles-list" spacing={5}>
        {wrapped.map((e, index) => {
          return (
            <ArticleElement
              key={`archived-element${index}`}
              element={e}
              kind={ElementKind.Archived}
            />
          );
        })}
      </Stack>
      <Footer isLast={isLast} />
    </>
  ) : (
    <Login />
  );
}
