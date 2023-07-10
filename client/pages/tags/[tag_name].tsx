import {
  PaginationKind,
  WrappedData,
  Articles,
  Category,
} from "../../types/types";
import { Header } from "@/components/Header";
import { Pagination } from "@/components/Pagination";
import { GetServerSideProps } from "next";
import { InferGetServerSidePropsType } from "next";
import { getTagList, reloadTagList } from "../api/tags/[tag_name]";
import { useRouter } from "next/router";
import { Main } from "@/components/Main";

type Data = Articles;

export const getServerSideProps: GetServerSideProps<{
  data: Data;
}> = async (context) => {
  if (context.params) {
    if (context.query.page) {
      const data = await reloadTagList(
        context.params.tag_name as string,
        context.query.page as string
      );
      return { props: { data } };
    }
    const data = await getTagList(context.params.tag_name as string);
    return { props: { data } };
  } else {
    return { props: { data: null } };
  }
};

export default function Tagged({
  data,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const router = useRouter();
  const page = router.query.page;
  const { tag_name: tagName } = router.query;

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
        Category.Tagged,
        wrapped,
        Pagination(page, isLast, PaginationKind.Tags),
        tagName as string
      )}
    </>
  );
}
