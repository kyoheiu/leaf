import {
  PaginationKind,
  Articles,
  ElementKind,
  WrappedData,
} from "../../types/types";
import ArticleElement from "@/components/ArticleElement";
import { Header } from "@/components/Header";
import { PageInfo } from "@/components/PageInfo";
import { Pagination } from "@/components/Pagination";
import { GetServerSideProps } from "next";
import { InferGetServerSidePropsType } from "next";
import Stack from "@mui/material/Stack";
import { getLikedArticles, reloadLikedArticles } from "../api/articles/liked";
import { useRouter } from "next/router";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/auth";

type Data = Articles;

export const getServerSideProps: GetServerSideProps<{
  data: Data;
}> = async (context) => {
  if (process.env.GITHUB_CLIENT_ID) {
    const session = await getServerSession(
      context.req,
      context.res,
      authOptions
    );
    if (!session) {
      return {
        redirect: {
          destination: "/api/auth/signin",
          permanent: false,
        },
      };
    }
  }
  if (context.query.page) {
    const data = await reloadLikedArticles(context.query.page as string);
    return { props: { data } };
  } else {
    const data = await getLikedArticles();
    return { props: { data } };
  }
};

export default function Liked({
  data,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const router = useRouter();
  const page = router.query.page;

  const list = data.data;
  const isLast = data.is_last;

  const wrapped: WrappedData[] = list.map((x) => ({
    visible: true,
    data: x,
  }));

  return (
    <>
      <Header />
      <Stack className="articles-list" spacing={6}>
        {PageInfo("/liked")}
        {wrapped.map((e, index) => {
          return (
            <ArticleElement
              key={`liked-element${index}`}
              element={e}
              kind={ElementKind.Liked}
            />
          );
        })}
        {Pagination(page, isLast, PaginationKind.Liked)}
      </Stack>
    </>
  );
}
