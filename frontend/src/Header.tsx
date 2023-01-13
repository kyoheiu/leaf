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

  const [url, setUrl] = createSignal("");
  const [_loading] = createResource(url, add_url);

  const [query, setQuery] = createSignal("");

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
      <li>archive</li>
      <li>liked</li>
    </ul>
  );
};

export default Header;
