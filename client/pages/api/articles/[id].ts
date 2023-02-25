import { Readability } from "@mozilla/readability";
import type { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "next-auth/react";
import puppeteer, { Browser } from "puppeteer";
import jsdom from "jsdom";

interface Progress {
  id: string;
  pos: number;
  prog: number;
}

export const getArticleContent = async (id: string) => {
  const target = `http://${process.env.NEXT_PUBLIC_HOST}:8000/articles/${id}`;
  const res = await fetch(target);
  const data = await res.json();
  return data;
};

const crawl = async (url: string, browser: Browser): Promise<string> => {
  console.log(url);
  const page = await browser.newPage();
  await page.goto(url);
  const text = await page.content();
  await page.close();
  return text;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await getSession({ req });
  const { id } = req.query;

  if (!session) {
    res.status(404).end();
  } else {
    if (req.method === "GET") {
      const data = await getArticleContent(id as string);
      return res.json(data);
    } else if (req.method === "POST") {
      let p: Progress = req.body;
      const target = `http://${process.env.NEXT_PUBLIC_HOST}:8000/articles/${p.id}?pos=${p.pos}&prog=${p.prog}`;
      const response = await fetch(target, { method: "POST" });
      if (!response.ok) {
        res.status(404).end();
      } else {
        res.status(200).end();
      }
    } else if (req.method === "DELETE") {
      const response = await fetch(
        `http://${process.env.NEXT_PUBLIC_HOST}:8000/articles/${id}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        res.status(404).end();
      } else {
        res.status(200).end();
      }
    }
  }
}
