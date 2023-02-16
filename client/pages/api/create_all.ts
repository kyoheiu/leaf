import type { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "next-auth/react";
import puppeteer, { Browser } from "puppeteer";

interface Content {
  url: string;
  html: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await getSession({ req });

  const crawl = async (url: string, browser: Browser): Promise<string> => {
    console.log(url);
    const page = await browser.newPage();
    await page.goto(url);
    const text = await page.content();
    return text;
  };

  if (!session || req.method !== "POST") {
    res.status(404).end();
  } else {
    console.log(req.body);
    const url: string[] = req.body.url;
    const browser = await puppeteer.launch();
    for (let x of url) {
      const html = await crawl(x, browser);
      const body = JSON.stringify({ url: x, html: html });
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
        console.log(response.status);
      }
    }

    res.status(303).setHeader("Location", "/").end();
  }
}
