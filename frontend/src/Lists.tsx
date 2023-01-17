import { A } from "@solidjs/router";
import {
  Component,
  createSignal,
  For,
  Show,
  createEffect,
  Switch,
  Match,
} from "solid-js";
import { IconButton } from "@hope-ui/solid";

import { state } from "./App";
import { filter_list, showArchived, showLiked } from "./Header";
import { ArticleData, State } from "./Types";
import { hide_archived, show_archived, show_liked_only } from "./utils";

export const [list, setList] = createSignal<ArticleData[]>([]);
export const [isBottom, setIsBottom] = createSignal(false);
export const [isLast, setIsLast] = createSignal(false);

const update_list = async (showArchived: boolean, showLiked: boolean) => {
  const res = await fetch("http://localhost:8000/");
  const j = await res.json();
  setList(() => filter_list(j, showArchived, showLiked));
};

createEffect(() => update_list(showArchived(), showLiked()));

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

const toggle_liked = async (id: string) => {
  const target = "http://localhost:8000/t?id=" + id + "&toggle=liked";
  fetch(target).then((res) => {
    if (!res.ok) {
      throw new Error("Cannot delete item.");
    }
    console.log(res.status);
  });

  const res = await fetch("http://localhost:8000/");
  const j = await res.json();
  setList(() => filter_list(j, showArchived(), showLiked()));
};

export const eachList = (article: ArticleData) => {
  let link = "/r/" + article.id;
  return (
    <>
      <div class="article">
        <div>{article.timestamp}</div>
        <div class="title">
          <A href={link}>{article.title}</A>
        </div>
        <div class="tag">
          <Show when={article.tags.length !== 0}>
            <For each={article.tags}>
              {(tag: string) => {
                let tag_link = "/tag/" + tag;
                return (
                  <>
                    <a href={tag_link}>{tag}</a>&nbsp
                  </>
                );
              }}
            </For>
          </Show>
        </div>
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
        <button onClick={() => delete_article(article.id)}>delete</button>
        <div class="beginning">{article.beginning}</div>
      </div>
    </>
  );
};

const Lists: Component = () => {
  window.addEventListener("scroll", () => {
    if (
      Math.abs(
        document.documentElement.scrollHeight -
          document.documentElement.clientHeight -
          document.documentElement.scrollTop
      ) < 1
    ) {
      setIsBottom(true);
      console.log("bottom");
    }
  });

  createEffect(() => {
    if (isBottom()) {
      const bottom_id = list().slice(-1)[0].id;
      const target = "http://localhost:8000/p?id=" + bottom_id;
      fetch(target).then((res) =>
        res.json().then((j) => {
          if (j.length === 0) {
            setIsLast(true);
          } else {
            setIsLast(false);
            setList((arr) =>
              arr.concat(filter_list(j, showArchived(), showLiked()))
            );
          }
        })
      );
      setIsBottom(false);
    }
  });

  return (
    <>
      <div class="lists">
        <For each={list()}>{(article: ArticleData) => eachList(article)}</For>
      </div>
      <div>
        <Show when={isLast()}>No more article in this page.</Show>
      </div>
    </>
  );
};

export default Lists;
function setState(Top: State) {
  throw new Error("Function not implemented.");
}
