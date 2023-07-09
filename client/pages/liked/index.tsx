import {
  PaginationKind,
  Articles,
  WrappedData,
  Category,
} from "../../types/types";
import { Header } from "@/components/Header";
import { Pagination } from "@/components/Pagination";
import { GetServerSideProps } from "next";
import { InferGetServerSidePropsType } from "next";
import { getLikedArticles, reloadLikedArticles } from "../api/articles/liked";
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
      {Main(
        Category.Liked,
        wrapped,
        Pagination(page, isLast, PaginationKind.Liked)
      )}
    </>
  );
}
