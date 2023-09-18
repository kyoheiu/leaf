import { Readability } from '@mozilla/readability';
import puppeteer, { Browser } from 'puppeteer';
import jsdom from 'jsdom';
import type { RequestHandler } from '@sveltejs/kit';
import { ulid } from 'ulid';
import * as fs from 'node:fs/promises';
import prisma from '$lib/server/client';
import logger from '$lib/logger';

const { JSDOM } = jsdom;

const crawl = async (url: string, browser: Browser): Promise<string> => {
	const page = await browser.newPage();
	await page.goto(url);
	const text = await page.content();
	await page.close();
	return text;
};

interface Req {
	url: string;
}

export const POST: RequestHandler = async (event) => {
	const req: Req = await event.request.json();
	const url = req.url;
	const header = event.request.headers.get('Authorization');
	if (header !== process.env.LEAF_API_TOKEN) {
		return new Response('Unauthorized request.', {
			status: 401
		});
	}

	const browser = await puppeteer.launch({
		executablePath: 'chromium',
		headless: 'new',
		args: ['--disable-gpu', '--disable-dev-shm-usage', '--disable-setuid-sandbox', '--no-sandbox']
	});
	logger.info(`Start crawling: ${url}`);
	let crawled = '';
	try {
		crawled = await crawl(url, browser);
	} catch (e) {
		logger.error(e);
		await browser.close();
	}
	await browser.close();

	const dom = new JSDOM(crawled, { url: url });
	const document = dom.window.document;
	const parsed = new Readability(document).parse();
	if (!parsed) {
		const message = 'Failed to parse the document.';
		logger.error(message);
		return new Response(message, {
			status: 500
		});
	}
	const cover = document.querySelector("[property='og:image']")?.getAttribute('content');

	const id = ulid();

	await prisma.articles.create({
		data: {
			id: id,
			url: url,
			title: parsed.title,
			html: parsed.content,
			cover: cover,
			beginning: parsed.excerpt,
			timestamp: new Date()
		}
	});

	try {
		await fs.writeFile(
			`${process.env.LEAF_DATA ?? './prisma/databases'}/.index/${id}`,
			`${parsed.title}\n${parsed.textContent}`
		);
	} catch (e) {
		return new Response(e as string, {
			status: 500
		});
	}

	logger.info(`Added new article: ${parsed.title}`);
	return new Response(null, {
		status: 201
	});
};
