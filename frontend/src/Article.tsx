import { useParams } from "@solidjs/router";
import {
  Component,
  createSignal,
  onMount,
  For,
  createResource,
  Resource,
} from "solid-js";
import { ArticleContent, ArticleData } from "./Types";

const Reading: Component = () => {
  const params = useParams();
  const [content] = createResource(() => params.id, fetchContent);

  return <div class="text">{JSON.stringify(content())}</div>;
};

const fetchContent = async (id: string): Promise<ArticleContent> => {
  let url = "http://localhost:8000/r/" + id;
  let res = await fetch(url);
  let j = await res.json();
  return j;
};

export default Reading;
