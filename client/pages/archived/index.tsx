import {
  Articles,
  WrappedData,
  PaginationKind,
  Category,
} from "../../types/types";
import { Header } from "@/components/Header";
import { Pagination } from "@/components/Pagination";
import { GetServerSideProps } from "next";
import { InferGetServerSidePropsType } from "next";
import {
  getArchivedArticles,
  reloadArchivedArticles,
} from "../api/articles/archived";
import { useRouter } from "next/router";
import { Main } from "@/components/Main";

type Data = Articles;

export const getServerSideProps: GetServerSideProps<{
  data: Data;
}> = async (context) => {
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
      {Main(
        Category.Archived,
        wrapped,
        Pagination(page, isLast, PaginationKind.Archived)
      )}
    </>
  );
}
