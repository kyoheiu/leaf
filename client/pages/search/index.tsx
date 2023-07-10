import {
  WrappedData,
  ArticleData,
  Category,
} from "../../types/types";
import { Header } from "@/components/Header";
import { GetServerSideProps } from "next";
import { searchArticles } from "../api/search";
import { Main } from "@/components/Main";

type Data = {
  query: string | string[];
  data: ArticleData[];
};

export const getServerSideProps: GetServerSideProps = async (context) => {
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
