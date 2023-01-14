import { A } from "@solidjs/router";
import { Component, createSignal, onMount, For, Show } from "solid-js";
import { showArchived, showLiked } from "./Header";
import { ArticleData } from "./Types";

export const [list, setList] = createSignal<ArticleData[]>([]);

onMount(async () => {
  const res = await fetch("http://localhost:8000/");
  const j = await res.json();
  const filtered = j.filter((e: ArticleData) => {
    return !e.archived;
  });
  console.log(JSON.stringify(filtered));
  setList(() => filtered);
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

  const toggle_archived = (id: string) => {
    const target = "http://localhost:8000/t?id=" + id + "&toggle=archived";
    fetch(target).then((res) => {
      if (!res.ok) {
        throw new Error("Cannot delete item.");
      }
      console.log(res.status);
    });
    setList((arr) =>
      arr.filter((e) => {
        return e.id !== id;
      })
    );
  };

  const toggle_liked = (id: string) => {
    const target = "http://localhost:8000/t?id=" + id + "&toggle=liked";
    fetch(target).then((res) => {
      if (!res.ok) {
        throw new Error("Cannot delete item.");
      }
      console.log(res.status);
    });
    let updated = "";
    if (showLiked()) {
      setList((arr) =>
        arr.filter((e) => {
          return e.id !== id;
        })
      );
      return;
    } else if (showArchived()) {
      updated = "http://localhost:8000/archived";
    } else {
      updated = "http://localhost:8000/";
    }
    fetch(updated).then((res) => {
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
            <button onClick={() => toggle_archived(article.id)}>
              <Show when={article.archived} fallback={"archive"}>
                unarchive
              </Show>
            </button>
            <button onClick={() => toggle_liked(article.id)}>
              <Show when={article.liked} fallback={"like"}>
                unlike
              </Show>
            </button>
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
function archived() {
  throw new Error("Function not implemented.");
}
