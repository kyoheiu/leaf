import {
  Component,
  createEffect,
  createRenderEffect,
  createResource,
  createSignal,
  Show,
} from "solid-js";
import { setList } from "./Lists";
import { ArticleData } from "./Types";

export const [showArchived, setShowArchived] = createSignal(false);
export const [showLiked, setShowLiked] = createSignal(false);

createEffect(async () => {
  const res = await fetch("http://localhost:8000/");
  const j = await res.json();
  if (showArchived()) {
    if (showLiked()) {
      setList(() =>
        j.filter((e: ArticleData) => {
          return e.archived && e.liked;
        })
      );
    } else {
      setList(() =>
        j.filter((e: ArticleData) => {
          return e.archived;
        })
      );
    }
  } else {
    if (showLiked()) {
      setList(() =>
        j.filter((e: ArticleData) => {
          return !e.archived && e.liked;
        })
      );
    } else {
      setList(() =>
        j.filter((e: ArticleData) => {
          return !e.archived;
        })
      );
    }
  }
}, showArchived());

createEffect(async () => {
  if (showLiked()) {
    if (showArchived()) {
      setList((arr) =>
        arr.filter((e) => {
          return e.archived;
        })
      );
    } else {
      setList((arr) =>
        arr.filter((e) => {
          return !e.archived && e.liked;
        })
      );
    }
  } else {
    const res = await fetch("http://localhost:8000/");
    const j = await res.json();
    if (showArchived()) {
      setList(() =>
        j.filter((e: ArticleData) => {
          return e.archived;
        })
      );
    } else {
      setList(() =>
        j.filter((e: ArticleData) => {
          return !e.archived;
        })
      );
    }
  }
}, showLiked());

const Header: Component = () => {
  const add_url = async () => {
    const res = await fetch("http://localhost:8000/a", {
      method: "POST",
      body: url(),
    });
    if (!res.ok) {
      console.log("Error: Cannot add url.");
    }
    setUrl(() => "");
    const updated = await fetch("http://localhost:8000/");
    setList(await updated.json());
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

  const [query, setQuery] = createSignal("");

  const [url, setUrl] = createSignal("");
  const [_loading] = createResource(url, add_url);

  return (
    <ul class="header">
      <li id="acidpaper">acidpaper</li>
      <li id="add">
        <input type="text" id="url" value={url()} />
        <button
          onClick={() =>
            setUrl(
              () =>
                (document.getElementById("url")! as HTMLTextAreaElement).value
            )
          }
        >
          ➕
        </button>
      </li>
      <li id="search">
        <input type="text" id="query" value={query()} />
        <button onClick={() => send_query()}>🔎</button>
      </li>
      <li>
        <Show
          when={showArchived()}
          fallback={
            <button onClick={() => setShowArchived((v) => !v)} class="inactive">
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
  );
};

export default Header;
