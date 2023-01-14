import DOMPurify from "dompurify";
import { useParams } from "@solidjs/router";
import {
  Component,
  createSignal,
  onMount,
  For,
  createResource,
  Resource,
  Show,
  on,
} from "solid-js";
import { ArticleContent, ArticleData } from "./Types";
import { fetch_pos } from "./utils";

const Reading: Component = () => {
  const params = useParams();

  const [article, setArticle] = createSignal<ArticleContent>({
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

  onMount(async () => {
    let target = "http://localhost:8000/r/" + params.id;
    const res = await fetch(target);
    const j = await res.json();
    console.log(JSON.stringify(j));
    setArticle(() => j);

    const scroll = Math.round(
      (document.documentElement.scrollHeight * parseInt(article().position)) /
        100
    );
    window.scrollTo(0, scroll);
  });

  window.addEventListener("scroll", (_event) => {
    fetch_pos();
  });

  return (
    <div class="text" innerHTML={DOMPurify.sanitize(article()!.html)}></div>
  );
};

export default Reading;
