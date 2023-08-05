import { Readability } from "@mozilla/readability";
import type { NextApiRequest, NextApiResponse } from "next";
import puppeteer, { Browser } from "puppeteer";
import jsdom from "jsdom";
import type { ArticleScraped } from "../../types/types";

export const getArticles = async () => {
  const response = await fetch(
    `http://${process.env.NEXT_PUBLIC_HOST}:8000/articles`
  );
  const data = await response.json();
  return data;
};

export const reloadArticles = async (page: string) => {
  const response = await fetch(
    `http://${process.env.NEXT_PUBLIC_HOST}:8000/articles?page=${page}`
  );
  const data = await response.json();
  return data;
};

export const createArticle = async (url: string) => {
  const { JSDOM } = jsdom;

	const browser = await puppeteer.launch({
		executablePath: "chromium",
		headless: true,
		args: [
			"--disable-gpu",
			"--disable-dev-shm-usage",
			"--disable-setuid-sandbox",
			"--no-sandbox",
		],
	});
	const crawled = await crawl(url, browser);
	await browser.close();

	const dom = new JSDOM(crawled, { url: url });
	const document = dom.window.document;
	const parsed = new Readability(document).parse();
	if (!parsed) {
		throw Error("Cannot parse document.");
	}

	const cover = document
		.querySelector("[property='og:image']")
		?.getAttribute("content");

	const content: ArticleScraped = {
		url: url,
		title: parsed.title ?? "",
		html: parsed.content ?? "",
		cover: cover ?? "",
	};
	return await fetch(`http://${process.env.NEXT_PUBLIC_HOST}:8000/articles`, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify(content)
	});
};

const crawl = async (url: string, browser: Browser): Promise<string> => {
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
  if (req.method === "GET") {
    const query = req.query;
    if (!query.page) {
      const data = await getArticles();
      return res.json(data);
    } else {
      const data = await reloadArticles(query.page as string);
      return res.json(data);
    }
  } else if (req.method === "POST") {
    const url: string = req.body;
    const response = await createArticle(url);
    if (!response.ok) {
      res.send(response.body);
    } else {
      res.status(303).setHeader("Location", "/").end();
    }
  } else {
    res.status(404).end();
  }
}
