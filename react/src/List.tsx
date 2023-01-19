import { Component, useContext, useEffect, useState } from "react";
import reactLogo from "./assets/react.svg";
import "./App.css";
import { ArticleData } from "./Types";
import { Link } from "react-router-dom";
import { useRecoilState } from "recoil";
import { listState } from "./contexts/atoms";

const Lists = () => {
  const [list, setList] = useRecoilState(listState);
  const [isBottom, setIsBottom] = useState(false);
  const [isLast, setIsLast] = useState(false);

  const delete_article = (id: string) => {
    const target = "http://localhost:8000/d/" + id;
    fetch(target).then((res) => {
      if (!res.ok) {
        throw new Error("Cannot delete item.");
      }
      console.log(res.status);
    });
    setList((arr) => arr.filter((article) => article.id !== id));
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

  const toggle_liked = (id: string) => {
    const target = "http://localhost:8000/t?id=" + id + "&toggle=liked";
    fetch(target).then((res) => {
      if (!res.ok) {
        throw new Error("Cannot delete item.");
      }
      console.log(res.status);
    });
    let new_list: ArticleData[] = [];
    for (let article of list) {
      if (article.id === id) {
        article.liked = !article.liked;
      }
      new_list.push(article);
    }
    setList(() => new_list);
  };

  const eachList = (article: ArticleData) => {
    let link = "/r/" + article.id;
    return (
      <>
        <div className="article">
          <div>{article.timestamp}</div>
          <div className="title">
            <Link to={link}>{article.title}</Link>
          </div>
          <div className="tag">
            {article.tags.map((tag) => {
              let tag_link = "/tag/" + tag;
              return (
                <>
                  <a href={tag_link}>{tag}</a>&nbsp
                </>
              );
            })}
          </div>
          <button onClick={() => toggle_archived(article.id)}>
            {article.archived ? "unarchive" : "archive"}
          </button>
          <button onClick={() => toggle_liked(article.id)}>
            {article.liked ? "unlike" : "like"}
          </button>
          <button onClick={() => delete_article(article.id)}>delete</button>
          <div className="beginning">{article.beginning}</div>
        </div>
      </>
    );
  };

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

  useEffect(() => {
    if (isBottom) {
      const bottom_id = list.slice(-1)[0].id;
      const target = "http://localhost:8000/p?id=" + bottom_id;
      fetch(target).then((res) =>
        res.json().then((j) => {
          if (j.length === 0) {
            setIsLast(true);
          } else {
            setIsLast(false);
            setList((arr) => arr.concat(j));
          }
        })
      );
      setIsBottom(false);
    }
  }, [isBottom]);

  useEffect(() => {
    const update_list = async () => {
      const res = await fetch("http://localhost:8000");
      const j = await res.json();
      setList(j);
    };
    update_list();
  }, []);

  return (
    <>
      <div className="lists">{list.map((article) => eachList(article))}</div>
      <div>{isLast && "No more article in this page."}</div>
    </>
  );
};

export default Lists;
