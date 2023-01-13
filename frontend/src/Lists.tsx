import { A } from "@solidjs/router";
import { Component, createSignal, onMount, For } from "solid-js";
import { ArticleData } from "./Types";

export const [list, setList] = createSignal<ArticleData[]>([]);

onMount(async () => {
  const res = await fetch("http://localhost:8000/");
  setList(await res.json());
});

const Lists: Component = () => {
  const delete_article = (id: string) => {
    const target = "http://localhost:8000/d/" + id;
    fetch(target).then((res) => {
      if (!res.ok) {
        throw new Error("Cannot delete item.");
      }
      console.log(res.status);
    });
    fetch("http://localhost:8000/").then((res) => {
      res.json().then((j) => setList(j));
    });
  };

  const eachList = (article: ArticleData) => {
    let link = "/r/" + article.id;
    return (
      <>
        <div class="article">
          <div>{article.timestamp}</div>
          <div>
            <A href={link}>{article.title}</A>{" "}
            <button onClick={() => delete_article(article.id)}>delete</button>
          </div>
          <div>{article.beginning}</div>
        </div>
      </>
    );
  };

  return (
    <div class="lists">
      <For each={list()}>{(article: ArticleData) => eachList(article)}</For>
    </div>
  );
};

export default Lists;
