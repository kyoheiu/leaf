import { A, useParams } from "@solidjs/router";
import { Component, createEffect, For, Match, Show, Switch } from "solid-js";
import { setState } from "./App";
import {
  eachList,
  isBottom,
  isLast,
  list,
  setIsBottom,
  setIsLast,
  setList,
} from "./Lists";
import { State, ArticleData } from "./Types";

export const Tag: Component = () => {
  setState(State.Tag);
  const params = useParams();

  const target = "http://localhost:8000/tag/" + params.name;
  fetch(target).then((res) => {
    res.json().then((j) => {
      console.log(JSON.stringify(j));
      setList(j);
    });
  });

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

  createEffect(() => {
    if (isBottom()) {
      const bottom_id = list().slice(-1)[0].id;
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
  });

  const eachListOfTag = (article: ArticleData) => {
    let link = "/r/" + article.id;
    return (
      <>
        <div class="article">
          <div>{article.timestamp}</div>
          <div class="title">
            <A href={link}>{article.title}</A>
          </div>
          <div class="tag">
            <Show when={article.tags.length !== 0}>
              <For each={article.tags}>
                {(tag: string) => {
                  let tag_link = "/tag/" + tag;
                  return (
                    <>
                      <a href={tag_link}>{tag}</a>&nbsp
                    </>
                  );
                }}
              </For>
            </Show>
          </div>
          <div class="beginning">{article.beginning}</div>
        </div>
      </>
    );
  };

  return (
    <>
      <div>TAG: {params.name}</div>
      <div class="lists">
        <For each={list()}>
          {(article: ArticleData) => eachListOfTag(article)}
        </For>
      </div>
      <div>
        <Show when={isLast()}>No more article in this page.</Show>
      </div>
    </>
  );
};
