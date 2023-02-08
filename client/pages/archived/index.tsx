import { ArticleData, ElementKind, WrappedData } from "../../types/types";
import ArticleElement from "../../components/ArticleElement";
import { Header } from "../../components/Header";
import Footer from "../../components/Footer";
import { GetServerSideProps } from "next";
import { InferGetServerSidePropsType } from "next";
import { useState, useEffect } from "react";

type Data = ArticleData[];

export const getServerSideProps: GetServerSideProps<{
  data: Data;
}> = async () => {
  const res = await fetch(`http://${process.env.HOST}:8000/articles/archived`);
  const data = await res.json();
  return { props: { data } };
};

export default function Archived({
  data,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
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
        `http://${process.env.HOST}:8000/articles/archived?reload=` +
        list.slice(-1)[0].id;
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

  if (!data) {
    return <h1>No article found.</h1>;
  }

  const wrapped: WrappedData[] = list.map((x) => ({
    visible: true,
    data: x,
  }))!;

  return (
    <>
      <Header />
      {wrapped.map((e, index) => {
        return (
          <ArticleElement
            key={"archived-element" + { index }}
            element={e}
            kind={ElementKind.Archived}
          />
        );
      })}
      <Footer isLast={isLast} />
    </>
  );
}
