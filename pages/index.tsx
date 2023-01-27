import { ArticleData, ElementKind, WrappedData } from "../types/types";
import ArticleElement from "../components/ArticleElement";
import { Header } from "../components/Header";
import Footer from "../components/Footer";
import { GetServerSideProps } from "next";
import { InferGetServerSidePropsType } from "next";
import { useEffect, useState } from "react";

type Data = ArticleData[];

export const getServerSideProps: GetServerSideProps<{
  data: Data;
}> = async () => {
  const res = await fetch("http://127.0.0.1:8000/articles");
  const data = await res.json();
  return { props: { data } };
};

export default function Home({
  data,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  if (!data) {
    return <h1>No article found.</h1>;
  }

  const [list, setList] = useState<ArticleData[]>(data);
  const [isBottom, setIsBottom] = useState(false);
  const [isLast, setIsLast] = useState(false);

  useEffect(() => {
    globalThis.addEventListener("scroll", () => {
      if (
        Math.abs(
          document.documentElement.scrollHeight -
            document.documentElement.clientHeight -
            document.documentElement.scrollTop
        ) < 1
      ) {
        setIsBottom(true);
        console.log("bottom");
      }
    });
  }, []);

  useEffect(() => {
    if (isBottom) {
      const target =
        "http://127.0.0.1:8000/articles?reload=" + list.slice(-1)[0].id;
      fetch(target).then((res) =>
        res.json().then((j) => {
          if (j.length === 0) {
            setIsLast(true);
          } else {
            setList((arr) => arr.concat(j));
          }
        })
      );
      setIsBottom(false);
    }
  });

  const wrapped: WrappedData[] = list.map((x) => ({
    visible: true,
    data: x,
  }))!;

  return (
    <>
      <Header />
      <li>
        {wrapped.map((e, index) => {
          return (
            <ArticleElement key={index} element={e} kind={ElementKind.Top} />
          );
        })}
      </li>
      <Footer isLast={isLast} />
    </>
  );
}
