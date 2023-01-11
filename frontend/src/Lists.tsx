import { Component, createSignal, onMount, For } from "solid-js";
import { Article } from "./Types";

const [list, setList] = createSignal([]);

onMount(async () => {
  const res = await fetch("http://localhost:8000/");
  setList(await res.json());
});

const Lists: Component = () => {
  return (
    <div class="lists">
      <ul>
        <For each={list()}>
          {(article: Article) => <li>{article.title}</li>}
        </For>
      </ul>
    </div>
  );
};

export default Lists;
