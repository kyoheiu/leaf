import type { NextApiRequest, NextApiResponse } from "next";
import puppeteer, { Browser, Puppeteer } from "puppeteer";

interface Content {
  url: string;
  html: string;
}

const crawl = async (url: string, browser: Browser): Promise<string> => {
  console.log(url);
  const page = await browser.newPage();
  await page.goto(url);
  const text = await page.content();
  return text;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    res.status(404).end();
  } else {
    console.log(req.body);
    const url: string[] = req.body.url;
    const browser = await puppeteer.launch();
    for (let x of url) {
      const html = await crawl(x, browser);
      const body = JSON.stringify({ url: url, html: html });
      const response = await fetch("http://127.0.0.1:8000/articles", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: body,
      });
      if (!response.ok) {
        console.log("Cannot create new article.");
      }
    }

    res.status(303).setHeader("Location", "/").end();
  }
}