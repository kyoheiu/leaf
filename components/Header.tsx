import { useEffect, useState } from "react";

export const Header = () => {
  const [url, setUrl] = useState<string>("");

  const handle_input = async () => {
    const response = await fetch("http://127.0.0.1:8000/articles", {
      method: "POST",
      body: url,
    });
    if (!response.ok) {
      console.log("Cannot create new article.");
    }
  };

  return (
    <>
      <div className="header">
        <li>
          <ul>
            <a href="/">acidpaper</a>
          </ul>
          <form action="/api/create" method="POST">
            <input name="url" type="URL" />
            <button type="submit">Add</button>
          </form>
          <ul>
            <form action="/search" method="GET">
              <input type="text" id="query" name="q" />
              <button type="submit">Search</button>
            </form>
          </ul>
          <ul>
            <a href="/archived">archived</a>
          </ul>
          <ul>
            <a href="/liked">liked</a>
          </ul>
        </li>
      </div>
    </>
  );
};
