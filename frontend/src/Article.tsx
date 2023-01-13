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

  const get_scroll_position = () => {
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

  const fetch_pos = async () => {
    const url = location.href;
    const id = url.split("/").pop();

    const numbers = get_scroll_position();
    console.log(
      "id: " + id + " pos: " + numbers.pos + " prog: " + numbers.prog
    );
    const target =
      "http://localhost:8000/u?id=" +
      id +
      "&pos=" +
      numbers.pos +
      "&prog=" +
      numbers.prog;
    fetch(target).then((response) => {
      if (!response.ok) {
        throw new Error("Cannot update scroll position.");
      }
    });
  };

  window.addEventListener("scroll", (_event) => {
    fetch_pos();
  });

  return (
    <div class="text" innerHTML={DOMPurify.sanitize(article()!.html)}></div>
  );
};

export default Reading;
