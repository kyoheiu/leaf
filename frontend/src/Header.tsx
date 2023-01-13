import { Component, createResource, createSignal } from "solid-js";
import { setList } from "./Lists";

const Header: Component = () => {
  const add_url = async () => {
    const res = await fetch("http://localhost:8000/a", {
      method: "POST",
      body: url(),
    });
    if (!res.ok) {
      console.log("Error: Cannot");
    }
    const updated = await fetch("http://localhost:8000/");
    setList(await updated.json());
  };

  const [url, setUrl] = createSignal("");
  const [_loading] = createResource(url, add_url);

  return (
    <div class="header">
      <div id="acidpaper">acidpaper</div>
      <input type="text" id="url" value={url()} />
      <button
        onClick={() =>
          setUrl(
            () => (document.getElementById("url")! as HTMLTextAreaElement).value
          )
        }
      >
        add
      </button>
    </div>
  );
};

export default Header;
