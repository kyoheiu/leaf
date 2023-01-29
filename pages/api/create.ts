import type { NextApiRequest, NextApiResponse } from "next";
import puppeteer from "puppeteer";

interface Content {
  url: string;
  html: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    res.status(404).end();
  } else {
    const crawl = async (url: string): Promise<string> => {
      const browser = await puppeteer.launch();
      const page = await browser.newPage();
      await page.goto(url);
      const text = await page.content();
      return text;
    };

    let url: string = req.body.url;
    const html = await crawl(url);
    const body = JSON.stringify({ url: url, html: html });
    console.log(body);
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

    res.status(303).setHeader("Location", "/").end();
  }
}
