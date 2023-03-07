import { ArticleData, ElementKind, WrappedData } from "../types/types";
import ArticleElement from "../components/ArticleElement";
import { Header } from "../components/Header";
import Footer from "../components/Footer";
import { GetServerSideProps, InferGetServerSidePropsType } from "next";
import { useEffect, useState } from "react";
import Stack from "@mui/material/Stack";
import { useSession } from "next-auth/react";
import { getArticles } from "./api/articles";
import { getServerSession } from "next-auth";
import { authOptions } from "./api/auth/[...nextauth]";
import useBottomEffect from "../hooks/useBottomEffect";
import Login from "../components/Login";

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
    const data = await getArticles();
    return { props: { data } };
  }
};

export default function Home({
  data,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const { data: session, status } = useSession({ required: true });

  const [list, setList] = useState<ArticleData[]>(data);
  const [isBottom, setIsBottom] = useState(false);
  const [isLast, setIsLast] = useState(false);

  useBottomEffect(setIsBottom);

  useEffect(() => {
    if (isBottom) {
      fetch(`/api/articles?reload=${list.slice(-1)[0].id}`).then((res) => {
        res.json().then((j) => {
          if (j.length === 0) {
            setIsLast(true);
          } else {
            setList((arr) => arr.concat(j));
          }
        });
      });
      setIsBottom(false);
    }
  });

  if (status === "loading") {
    console.log("loading...");
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
              key={`index-element${index.toString()}`}
              element={e}
              kind={ElementKind.Top}
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
