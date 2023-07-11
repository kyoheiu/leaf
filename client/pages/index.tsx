import {
  Articles,
  WrappedData,
  PaginationKind,
  Category,
} from "../types/types";
import { Header } from "@/components/Header";
import { Pagination } from "@/components/Pagination";
import { FooterImage } from "@/components/Footer";
import { GetServerSideProps, InferGetServerSidePropsType } from "next";
import { getArticles, reloadArticles } from "./api/articles";
import { useRouter } from "next/router";
import { Main } from "@/components/Main";

type Data = Articles;

export const getServerSideProps: GetServerSideProps<{
  data: Data;
}> = async (context) => {
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
          {FooterImage()}
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
