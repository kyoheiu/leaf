import { useParams } from "@solidjs/router";
import {
  Component,
  createSignal,
  onMount,
  For,
  createResource,
} from "solid-js";
import { Article } from "./Types";

const Reading: Component = () => {
  //   const [text, setText] = createSignal("");
  //   const [position, setPosition] = createSignal(0);
  //   const [progress, setProgress] = createSignal(0);

  //   const params = useParams();
  //   const [html] = createResource(() => params.id, fetchContent);

  return <div class="text">test</div>;
};

const fetchContent = async (id: string) => {
  let res = await fetch("http://localhost:8000/r/{id}");
  let j = await res.json();
  return j.html;
};

export default Reading;
