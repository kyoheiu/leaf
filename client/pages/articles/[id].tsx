import { ArticleContent } from "../../types/types";
import { useEffect, useState } from "react";
import { GetServerSideProps, InferGetServerSidePropsType } from "next";
import { useRouter } from "next/router";
import Button from "@mui/material/Button";
import Divider from "@mui/material/Divider";
import Typography from "@mui/material/Typography";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import FavoriteIcon from "@mui/icons-material/Favorite";
import ArchiveIcon from "@mui/icons-material/Archive";
import UnarchiveIcon from "@mui/icons-material/Unarchive";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import Login from "../../components/Login";
import { useSession } from "next-auth/react";

type Data = ArticleContent;

export const getServerSideProps: GetServerSideProps<{
  data: Data;
}> = async (context) => {
  if (context.params) {
    const id = context.params.id;
    const target = `http://${process.env.NEXT_PUBLIC_HOST}:8000/articles/${id}`;
    const res = await fetch(target);
    const data = await res.json();
    return { props: { data } };
  } else {
    return { props: { data: [] } };
  }
};

export default function Article({
  data,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const { data: session } = useSession();

  const router = useRouter();
  const [articleContent, setArticleContent] = useState<ArticleContent>(data);

  const [shouldSaveScroll, setShouldSaveScroll] = useState(true);

  const getScrollPosition = () => {
    const bodyheight = document.documentElement.scrollHeight;
    const scrolled = document.documentElement.scrollTop;
    const client = document.documentElement.clientHeight;
    const pos = Math.round((scrolled * 100) / bodyheight);
    const prog = Math.abs(bodyheight - client - scrolled);
    if (prog < 1) {
      return { pos: pos, prog: 100 };
    } else {
      return { pos: pos, prog: 100 - Math.round((prog * 100) / bodyheight) };
    }
  };

  const saveScrollPos = () => {
    if (shouldSaveScroll) {
      const n = getScrollPosition();
      if (n.pos !== 0) {
        const target = `http://localNEXT_PUBLIC_HOST:8000/articles/${articleContent.id}?pos=${n.pos}&prog=${n.prog}`;
        fetch(target, { method: "POST" }).then((res) => {
          if (!res.ok) {
            console.error("Cannot update progress.");
          }
        });
      }
    }
  };

  const restoreScrollPos = () => {
    const scroll = Math.round(
      (document.documentElement.scrollHeight * articleContent.position) / 100
    );
    console.log(articleContent.position);
    globalThis.scrollTo(0, scroll);
  };

  useEffect(() => {
    restoreScrollPos();
  }, []);

  useEffect(() => {
    globalThis.addEventListener("scroll", saveScrollPos);
    return () => globalThis.removeEventListener("scroll", saveScrollPos);
  }, []);

  useEffect(() => {
    const setSaveOff = () => {
      setShouldSaveScroll((_v) => false);
    };
    router.beforePopState(({}) => {
      setShouldSaveScroll(() => false);
      console.log(shouldSaveScroll);
      return true;
    });
    router.events.on("routeChangeStart", setSaveOff);
    return () => {
      router.events.off("routeChangeStart", setSaveOff);
    };
  }, []);

  const toggle_like = async () => {
    const target = `http://localNEXT_PUBLIC_HOST:8000/articles/${articleContent.id}?toggle=liked`;
    const res = await fetch(target, { method: "POST" });
    if (!res.ok) {
      console.log("Cannot toggle like.");
    }

    setArticleContent((x) => ({
      ...x,
      liked: !x.liked,
    }));
  };

  const toggle_archive = async () => {
    const target = `http://localNEXT_PUBLIC_HOST:8000/articles/${articleContent.id}?toggle=archived`;
    const res = await fetch(target, { method: "POST" });
    if (!res.ok) {
      console.log("Cannot archive article.");
    }

    setArticleContent((x) => ({
      ...x,
      archived: !x.archived,
    }));
  };

  const delete_article = async () => {
    const target = `http://localNEXT_PUBLIC_HOST:8000/articles/${articleContent.id}`;
    const res = await fetch(target, { method: "DELETE" });
    if (!res.ok) {
      console.log("Cannot delete article.");
    } else {
      globalThis.location.href = "/";
    }
  };
  if (!articleContent) {
    return <h1>No article found.</h1>;
  }

  const create_markup = () => {
    return { __html: articleContent.html };
  };

  const Buttons = ({ data }: { data: ArticleContent }) => {
    return (
      <div className="buttons">
        <Button onClick={toggle_like}>
          {data.liked ? (
            <FavoriteIcon sx={{ fontSize: 20 }} />
          ) : (
            <FavoriteBorderIcon sx={{ fontSize: 20 }} />
          )}
        </Button>
        <Button onClick={toggle_archive}>
          {data.archived ? (
            <UnarchiveIcon sx={{ fontSize: 20 }} />
          ) : (
            <ArchiveIcon sx={{ fontSize: 20 }} />
          )}
        </Button>
        <Button onClick={delete_article}>
          <DeleteForeverIcon sx={{ fontSize: 20 }} />
        </Button>
      </div>
    );
  };

  return session ? (
    <>
      <div className="article-title">{articleContent.title}</div>
      <div className="article-url">{articleContent.url}</div>
      <Buttons data={articleContent} />
      <Divider className="article-divider" />
      <div dangerouslySetInnerHTML={create_markup()} />
      <Divider className="article-divider" />
      <Buttons data={articleContent} />
      <Typography className="ending" color="secondary">
        End of this article.
      </Typography>
    </>
  ) : (
    <Login />
  );
}
