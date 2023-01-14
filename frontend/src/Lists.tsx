import { A } from "@solidjs/router";
import {
  Component,
  createSignal,
  onMount,
  For,
  Show,
  createEffect,
  createRenderEffect,
} from "solid-js";
import { ArticleData } from "./Types";
import { hide_archived, show_archived, show_liked_only } from "./utils";

const [list, setList] = createSignal<ArticleData[]>([]);
const [showArchived, setShowArchived] = createSignal(false);
const [showLiked, setShowLiked] = createSignal(false);
const [query, setQuery] = createSignal("");
const [url, setUrl] = createSignal("");
const [isBottom, setIsBottom] = createSignal(false);

const filter_list = (
  arr: ArticleData[],
  showArchived: boolean,
  showLiked: boolean
): ArticleData[] => {
  if (!showArchived && !showLiked) {
    return arr.filter(hide_archived);
  } else if (!showArchived && showLiked) {
    return arr.filter(hide_archived).filter(show_liked_only);
  } else if (showArchived && !showLiked) {
    return arr.filter(show_archived);
  } else {
    return arr.filter(show_archived).filter(show_liked_only);
  }
};

const update_list = async (showArchived: boolean, showLiked: boolean) => {
  const res = await fetch("http://localhost:8000/");
  const j = await res.json();
  setList(() => filter_list(j, showArchived, showLiked));
};

createEffect(() => update_list(showArchived(), showLiked()));

const add_url = async () => {
  setUrl(() => (document.getElementById("url")! as HTMLTextAreaElement).value);
  const res = await fetch("http://localhost:8000/a", {
    method: "POST",
    body: url(),
  });
  if (!res.ok) {
    console.log("Error: Cannot add url.");
  }
  setUrl(() => "");
  const updated = await fetch("http://localhost:8000/");
  const j = await updated.json();
  setList(filter_list(j, showArchived(), showLiked()));
};

const send_query = async () => {
  setQuery(
    () => (document.getElementById("query")! as HTMLTextAreaElement).value
  );
  const target = "http://localhost:8000/s?q=" + query();
  console.log(target);
  const matched = await fetch(target);
  if (!matched.ok) {
    console.log("Error: Cannot search documents.");
  }
  setList(await matched.json());
  setQuery(() => "");
};

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

const eachList = (article: ArticleData) => {
  let link = "/r/" + article.id;
  return (
    <>
      <div class="article">
        <div>{article.timestamp}</div>
        <div class="title">
          <A href={link}>{article.title}</A>
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
        res
          .json()
          .then((j) =>
            setList((arr) =>
              arr.concat(filter_list(j, showArchived(), showLiked()))
            )
          )
      );
      setIsBottom(false);
    }
  });

  return (
    <>
      <ul class="header">
        <li id="acidpaper">acidpaper</li>
        <li id="add">
          <input type="text" id="url" value={url()} />
          <button onClick={() => add_url()}>➕</button>
        </li>
        <li id="search">
          <input type="text" id="query" value={query()} />
          <button onClick={() => send_query()}>🔎</button>
        </li>
        <li>
          <Show
            when={showArchived()}
            fallback={
              <button
                onClick={() => setShowArchived((v) => !v)}
                class="inactive"
              >
                archived
              </button>
            }
          >
            <button onClick={() => setShowArchived((v) => !v)} class="active">
              archived
            </button>
          </Show>
        </li>
        <li>
          <Show
            when={showLiked()}
            fallback={
              <button onClick={() => setShowLiked((v) => !v)} class="inactive">
                liked
              </button>
            }
          >
            <button onClick={() => setShowLiked((v) => !v)} class="active">
              liked
            </button>
          </Show>
        </li>
      </ul>
      <div class="lists">
        <For each={list()}>{(article: ArticleData) => eachList(article)}</For>
      </div>
    </>
  );
};

export default Lists;
