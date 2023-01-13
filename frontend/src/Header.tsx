import { Component, createResource, createSignal } from "solid-js";
import { setList } from "./Lists";

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

  const search_query = async () => {
    const target = "http://localhost:8000/s?q=" + query();
    const res = await fetch(target);
    if (!res.ok) {
      console.log("Error: Cannot search documents.");
    }
    setQuery(() => "");
    setList(await res.json());
  };

  const [url, setUrl] = createSignal("");
  const [_loading] = createResource(url, add_url);

  const [query, setQuery] = createSignal("");
  const [_searching] = createResource(query, search_query);

  return (
    <div class="header">
      <div id="acidpaper">acidpaper</div>
      <div id="add">
        <input type="text" id="url" value={url()} />
        <button
          onClick={() =>
            setUrl(
              () =>
                (document.getElementById("url")! as HTMLTextAreaElement).value
            )
          }
        >
          add
        </button>
      </div>
      <div id="search">
        <input type="text" id="query" value={query()} />
        <button
          onClick={() =>
            setUrl(
              () =>
                (document.getElementById("query")! as HTMLTextAreaElement).value
            )
          }
        >
          search
        </button>
      </div>
    </div>
  );
};

export default Header;
