import { A } from "@solidjs/router";
import { Component, createSignal, onMount, For } from "solid-js";
import { ArticleData } from "./Types";

export const [list, setList] = createSignal([]);

onMount(async () => {
  const res = await fetch("http://localhost:8000/");
  setList(await res.json());
});

const Lists: Component = () => {
  return (
    <div class="lists">
      <For each={list()}>{(article: ArticleData) => eachList(article)}</For>
    </div>
  );
};

const eachList = (article: ArticleData) => {
  let link = "/r/" + article.id;
  return (
    <>
      <div class="article">
        <div>{article.timestamp}</div>
        <div>
          <A href={link}>{article.title}</A>
        </div>
        <div>{article.beginning}</div>
      </div>
    </>
  );
};

export default Lists;
