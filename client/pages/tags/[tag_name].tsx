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
import Stack from "@mui/material/Stack";
import Footer from "../../components/Footer";
import { useState } from "react";
import { useRouter } from "next/router";
import useBottomEffect from "../../hooks/useBottomEffect";
import useReloadEffect from "../../hooks/useReloadEffect";

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
    if (context.params) {
      const data = await getTagList(context.params.tag_name as string);
      return { props: { data } };
    } else {
      return { props: { data: [] } };
    }
  }
};

export default function Tagged({
  data,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const { data: session, status } = useSession();

  const router = useRouter();
  const { tag_name } = router.query;
  const [list, setList] = useState<ArticleData[]>(data);
  const [isBottom, setIsBottom] = useState(false);
  const [isLast, setIsLast] = useState(false);

  useBottomEffect(setIsBottom);

  if (list.length !== 0) {
    useReloadEffect(
      `/api/tags/${tag_name}?reload=${list.slice(-1)[0].id}`,
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
        <div className="tag-name">TAG: {tag_name}</div>
        {wrapped.map((e, index) => {
          return (
            <ArticleElement
              key={`tagged-element${index}`}
              element={e}
              kind={ElementKind.Searched}
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
