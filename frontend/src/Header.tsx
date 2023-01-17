import { Button, IconButton, Input } from "@hope-ui/solid";
import { Component, createSignal, Show } from "solid-js";
import { setList } from "./Lists";
import { ArticleData } from "./Types";
import { hide_archived, show_liked_only, show_archived } from "./utils";

const [query, setQuery] = createSignal("");
const [url, setUrl] = createSignal("");
export const [showArchived, setShowArchived] = createSignal(false);
export const [showLiked, setShowLiked] = createSignal(false);

export const filter_list = (
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
  const target = "http://localhost:3000/s?q=" + query();
  location.href = target;
};

export const Header: Component = () => {
  return (
    <>
      <ul class="header">
        <li id="acidpaper">acidpaper</li>
        <li id="add">
          <form onSubmit={() => add_url()}>
            <Input type="text" id="url" value={url()} placeholder="Add" />
          </form>
        </li>
        <li id="search">
          <form onSubmit={() => send_query()}>
            <Input
              type="text"
              id="query"
              value={query()}
              placeholder="Search"
            />
          </form>
        </li>
        <li>
          <Show
            when={showArchived()}
            fallback={
              <Button
                variant="outline"
                onClick={() => setShowArchived((v) => !v)}
                class="inactive"
              >
                archived
              </Button>
            }
          >
            <Button
              variant="solid"
              onClick={() => setShowArchived((v) => !v)}
              class="active"
            >
              archived
            </Button>
          </Show>
        </li>
        <li>
          <Show
            when={showLiked()}
            fallback={
              <Button
                variant="outline"
                onClick={() => setShowLiked((v) => !v)}
                class="inactive"
              >
                liked
              </Button>
            }
          >
            <Button
              variant="solid"
              onClick={() => setShowLiked((v) => !v)}
              class="active"
            >
              liked
            </Button>
          </Show>
        </li>
      </ul>
    </>
  );
};
