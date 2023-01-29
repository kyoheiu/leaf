import Link from "next/link";
import { useEffect, useState } from "react";
import { Input } from "@chakra-ui/react";

export const Header = () => {
  const [url, setUrl] = useState<string>("");

  const handle_input = async (e: any) => {
    e.preventDefault();
    const response = await fetch("http://127.0.0.1:8000/articles", {
      method: "POST",
      body: url,
    });
    if (!response.ok) {
      console.log("Cannot create new article.");
    } else {
      globalThis.location.reload();
    }
  };

  return (
    <>
      <div className="header">
        <li>
          <ul>
            <Link href="/">acidpaper</Link>
          </ul>
          <form action="api/create" method="POST">
            <Input
              size="sm"
              width="auto"
              name="url"
              onChange={(e) => setUrl(() => e.target.value)}
              type="URL"
            />
            <button type="submit">Add</button>
          </form>
          <ul>
            <form action="/search" method="GET">
              <Input size="sm" width="auto" type="text" id="query" name="q" />
              <button type="submit">Search</button>
            </form>
          </ul>
          <ul>
            <Link href="/archived">archived</Link>
          </ul>
          <ul>
            <Link href="/liked">liked</Link>
          </ul>
        </li>
      </div>
    </>
  );
};
