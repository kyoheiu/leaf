import Link from "next/link";
import { useEffect, useState } from "react";
import { Input } from "@mui/material";
import Button from "@mui/material/Button";
import AddIcon from "@mui/icons-material/Add";
import SearchIcon from "@mui/icons-material/Search";
import { Add } from "@mui/icons-material";

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
              name="url"
              onChange={(e) => setUrl(() => e.target.value)}
              type="URL"
            />
            <Button type="submit">
              <Add />
            </Button>
          </form>
          <ul>
            <form action="/search" method="GET">
              <Input type="text" id="query" name="q" />
              <Button type="submit">
                <SearchIcon />
              </Button>
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
