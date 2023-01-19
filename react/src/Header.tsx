import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useRecoilState } from "recoil";
import { listState } from "./contexts/atoms";

const Header = () => {
  const [list, setList] = useRecoilState(listState);
  const [url, setUrl] = useState("");
  const [query, setQuery] = useState("");

  const add_url = (event) => {
    event?.preventDefault();
    setUrl(
      () => (document.getElementById("url")! as HTMLTextAreaElement).value
    );
    console.log(url);
    fetch("http://localhost:8000/a", {
      method: "POST",
      body: url,
    }).then((res) =>
      !res.ok ? console.log("Error: Cannot add url.") : console.log("Added.")
    );
    setUrl(() => "");
    fetch("http://localhost:8000/")
      .then((res) => res.json())
      .then((j) => setList(j));
  };

  const send_query = async () => {
    setQuery(
      () => (document.getElementById("query")! as HTMLTextAreaElement).value
    );
    const target = "http://localhost:3000/s?q=" + query;
    location.href = target;
  };

  return (
    <>
      <ul className="header">
        <li id="acidpaper">
          <Link to="/">acidpaper</Link>
        </li>
        <li id="add">
          <form onSubmit={add_url}>
            <input
              type="text"
              id="url"
              onChange={(e) => setUrl(() => e.target.value)}
              placeholder="Add"
            />
          </form>
        </li>
        <li id="search">
          <form onSubmit={() => send_query()}>
            <input type="text" id="query" value={query} placeholder="Search" />
          </form>
        </li>
        <li>
          <Link to="archive">archived</Link>
        </li>
      </ul>
    </>
  );
};

export default Header;
