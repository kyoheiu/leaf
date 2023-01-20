import { ArticleContent } from "@/types/Types";
import DOMPurify from "isomorphic-dompurify";
import { NextPage } from "next";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

const Article = () => {
  const router = useRouter();
  const { id } = router.query;

  const [article, setArticle] = useState<ArticleContent>({
    id: "",
    url: "",
    title: "",
    html: "",
    plain: "",
    position: "",
    progress: 0,
    archived: false,
    liked: false,
    timestamp: "",
  });

  useEffect(() => {
    const get_article = async () => {
      const target = "http://localhost:8000/r/" + id;
      const res = await fetch(target);
      const j = await res.json();
      setArticle(() => j);
    };
    get_article();
  }, []);

  const cleaned = DOMPurify.sanitize(article.html);
  const create_markup = () => {
    return { __html: cleaned };
  };

  return (
    <>
      <div dangerouslySetInnerHTML={create_markup()} />
      <div>End of the document.</div>
    </>
  );
};

export default Article;
