import {
  WrappedData,
  ElementKind,
  ArticleData,
  Category,
} from "../../types/types";
import { Header } from "@/components/Header";
import { GetServerSideProps } from "next";
import { searchArticles } from "../api/search";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/auth";
import { Main } from "@/components/Main";

type Data = {
  query: string | string[];
  data: ArticleData[];
};

export const getServerSideProps: GetServerSideProps = async (context) => {
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
  const q = context.query.q ?? [];
  const result = await searchArticles(q);
  return { props: { query: q, data: result } };
};

export default function Searched(props: Data) {
  const wrapped: WrappedData[] = props.data.map((x) => ({
    visible: true,
    data: x,
  }));

  return (
    <>
      <Header />
      {Main(Category.Searched, wrapped, undefined, undefined, props.query)}
    </>
  );
}
