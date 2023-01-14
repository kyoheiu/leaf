import { ArticleData } from "./Types";

export const show_archived = (e: ArticleData) => {
  return e.archived;
};

export const hide_archived = (e: ArticleData) => {
  return !e.archived;
};

export const show_liked_only = (e: ArticleData) => {
  return e.liked;
};

const get_scroll_position = () => {
  const bodyheight = document.documentElement.scrollHeight;
  const scrolled = document.documentElement.scrollTop;
  const client = document.documentElement.clientHeight;

  const pos = Math.round((scrolled * 100) / bodyheight);
  const prog = Math.abs(bodyheight - client - scrolled);
  if (prog < 1) {
    return { pos: pos, prog: 100 };
  } else {
    return { pos: pos, prog: 100 - Math.round((prog * 100) / bodyheight) };
  }
};

export const fetch_pos = async () => {
  const url = location.href;
  const id = url.split("/").pop();

  const numbers = get_scroll_position();
  console.log("id: " + id + " pos: " + numbers.pos + " prog: " + numbers.prog);
  const target =
    "http://localhost:8000/u?id=" +
    id +
    "&pos=" +
    numbers.pos +
    "&prog=" +
    numbers.prog;
  fetch(target).then((response) => {
    if (!response.ok) {
      throw new Error("Cannot update scroll position.");
    }
  });
};
