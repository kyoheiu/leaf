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

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await getSession({ req });

  if (!session || req.method !== "POST") {
    res.status(404).end();
  } else {
    const { JSDOM } = jsdom;
    console.log(req.body);
    let url: string = req.body;

    const browser = await puppeteer.launch({
      headless: true,
      args: [
        "--disable-gpu",
        "--disable-dev-shm-usage",
        "--disable-setuid-sandbox",
        "--no-sandbox",
      ],
    });
    const crawled = await crawl(url, browser);

    const dom = new JSDOM(crawled, { url: url });
    const document = dom.window.document;
    const parsed = new Readability(document).parse()!;

    const og = document
      .querySelector("[property='og:image']")
      ?.getAttribute("content");

    const content: Content = {
      url: url,
      title: parsed.title,
      html: parsed.content,
      plain: parsed.textContent,
      og: og,
    };
    const body = JSON.stringify(content);
    const response = await fetch(
      `http://${process.env.NEXT_PUBLIC_HOST}:8000/articles`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: body,
      }
    );
    if (!response.ok) {
      console.log("Cannot create new article.");
      res.status(500).end();
    } else {
      res.status(303).setHeader("Location", "/").end();
    }
  }
}
