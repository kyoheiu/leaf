import {
  Articles,
  ElementKind,
  WrappedData,
  PaginationKind,
  Category,
} from "../types/types";
import ArticleElement from "@/components/ArticleElement";
import { Header } from "@/components/Header";
import { Pagination } from "@/components/Pagination";
import { footerImage } from "@/components/Footer";
import { GetServerSideProps, InferGetServerSidePropsType } from "next";
import { getArticles, reloadArticles } from "./api/articles";
import { useRouter } from "next/router";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/auth";
import { Main } from "@/components/Main";

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
    const data = await reloadArticles(context.query.page as string);
    return { props: { data } };
  } else {
    const data = await getArticles();
    return { props: { data } };
  }
};

export default function Home({
  data,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const router = useRouter();
  const page = router.query.page;

  const list = data.data;
  const isLast = data.is_last;

  if (list.length === 0) {
    return (
      <>
        <Header />
        <div className="">
          <div>Add new articles from the form in the top bar.</div>
          {footerImage()}
        </div>
      </>
    );
  }

  const wrapped: WrappedData[] = list.map((x) => ({
    visible: true,
    data: x,
  }));

  return (
    <>
      <Header />
      {Main(
        Category.All,
        wrapped,
        Pagination(page, isLast, PaginationKind.Top)
      )}
    </>
  );
}
