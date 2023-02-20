import type { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "next-auth/react";
import puppeteer, { Browser } from "puppeteer";

interface Content {
  url: string;
  html: string;
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
    let url: string = req.body;
    console.log(req.body);

    // const browser = await puppeteer.launch({
    //   headless: true,
    //   args: [
    //     "--disable-gpu",
    //     "--disable-dev-shm-usage",
    //     "--disable-setuid-sandbox",
    //     "--no-sandbox",
    //   ],
    // });
    // const html = await crawl(url, browser);
    // const body = JSON.stringify({ url: url, html: html });
    const response = await fetch(
      `http://${process.env.NEXT_PUBLIC_HOST}:8000/articles`,
      {
        method: "POST",
        body: url,
      }
    );
    if (!response.ok) {
      console.log("Cannot create new article.");
      console.log(response.body);
      res.status(500).end();
    } else {
      res.status(303).setHeader("Location", "/").end();
    }
  }
}
