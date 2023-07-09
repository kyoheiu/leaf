import {
  Articles,
  ElementKind,
  WrappedData,
  PaginationKind,
} from "../../types/types";
import ArticleElement from "@/components/ArticleElement";
import { Header } from "@/components/Header";
import { PageInfo } from "@/components/PageInfo";
import { Pagination } from "@/components/Pagination";
import { GetServerSideProps } from "next";
import { InferGetServerSidePropsType } from "next";
import Stack from "@mui/material/Stack";
import {
  getArchivedArticles,
  reloadArchivedArticles,
} from "../api/articles/archived";
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
    const data = await reloadArchivedArticles(context.query.page as string);
    return { props: { data } };
  } else {
    const data = await getArchivedArticles();
    return { props: { data } };
  }
};

export default function Archived({
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
      <div className="flex justify-center">
          <a className="px-2" href="/">All</a>
          <a className="px-2" href="/liked">liked</a>
          <div className="border-b px-2">Archived</div>
      </div>
      <div className="mt-3">
        {wrapped.map((e, index) => {
          return (
            <ArticleElement
              key={`archived-element${index}`}
              element={e}
              kind={ElementKind.Archived}
            />
          );
        })}
        {Pagination(page, isLast, PaginationKind.Archived)}
      </div>
    </>
  );
}
