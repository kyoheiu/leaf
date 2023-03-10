import { ArticleData, ElementKind, WrappedData } from "../../types/types";
import ArticleElement from "../../components/ArticleElement";
import { Header } from "../../components/Header";
import Footer from "../../components/Footer";
import { GetServerSideProps } from "next";
import { InferGetServerSidePropsType } from "next";
import { useState } from "react";
import Login from "../../components/Login";
import { useSession } from "next-auth/react";
import Stack from "@mui/material/Stack";
import { getLikedArticles } from "../api/articles/liked";
import useBottomEffect from "../../hooks/useBottomEffect";
import useReloadEffect from "../../hooks/useReloadEffect";

type Data = ArticleData[];

export const getServerSideProps: GetServerSideProps<{
  data: Data;
}> = async (context) => {
  const data = await getLikedArticles();
  return { props: { data } };
};

export default function Liked({
  data,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const { data: session, status } = useSession();

  const [list, setList] = useState<ArticleData[]>(data);
  const [isBottom, setIsBottom] = useState(false);
  const [isLast, setIsLast] = useState(false);

  useBottomEffect(setIsBottom);

  if (list.length !== 0) {
    useReloadEffect(
      `/api/articles/liked?reload=${list.slice(-1)[0].id}`,
      isBottom,
      setIsBottom,
      list,
      setList,
      setIsLast
    );
  }

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
              key={`liked-element${index}`}
              element={e}
              kind={ElementKind.Liked}
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
