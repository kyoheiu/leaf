import { Readability } from "@mozilla/readability";
import type { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "next-auth/react";
import puppeteer, { Browser } from "puppeteer";
import jsdom from "jsdom";

interface Content {
  url: string;
  html: string;
  title: string;
  plain: string;
  og: string | null | undefined;
}

const crawl = async (url: string, browser: Browser): Promise<string> => {
  console.log(url);
  const page = await browser.newPage();
  await page.goto(url);
  const text = await page.content();
  await page.close();
  return text;
};

export const searchArticles = async (query: string | string[]) => {
  const target = `http://${process.env.NEXT_PUBLIC_HOST}:8000/search?q=${query}`;
  const response = await fetch(target);
  const data = await response.json();
  return data;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await getSession({ req });

  if (!session || req.method !== "POST") {
    res.status(404).end();
  } else {
    const query = req.query;
    if (!query.q) {
      res.status(404).end();
    } else {
      const data = await searchArticles(query.q);
      return res.json(data);
    }
  }
}
