import { Readability } from "@mozilla/readability";
import type { NextApiRequest, NextApiResponse } from "next";
import puppeteer, { Browser } from "puppeteer";
import jsdom from "jsdom";

export const getArticles = async () => {
	const response = await fetch(
		`http://${process.env.NEXT_PUBLIC_HOST}:8000/articles`,
	);
	const data = await response.json();
	return data;
};

const reloadArticles = async (id: string) => {
	const response = await fetch(
		`http://${process.env.NEXT_PUBLIC_HOST}:8000/articles?reload=${id}`,
	);
	const data = await response.json();
	return data;
};

export const createArticle = async (url: string) => {
	return await fetch(`http://${process.env.NEXT_PUBLIC_HOST}:8000/articles`, {
		method: "POST",
		body: url,
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
	res: NextApiResponse,
) {
	if (req.method === "GET") {
		const query = req.query;
		if (!query.reload) {
			const data = await getArticles();
			return res.json(data);
		} else {
			const data = await reloadArticles(query.reload as string);
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
