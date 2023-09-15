import prisma from '$lib/server/client';
import { Action } from '$lib/types';
import type { RequestHandler } from '@sveltejs/kit';
import * as fs from 'node:fs/promises';
import { Readability } from '@mozilla/readability';
import puppeteer, { Browser } from 'puppeteer';
import jsdom from 'jsdom';
import { ulid } from 'ulid';

interface Req {
	id: string;
	action: Action;
	url: string | null;
	current: number | null;
	pos: number | null;
	prog: number | null;
}

const { JSDOM } = jsdom;

const crawl = async (url: string, browser: Browser): Promise<string> => {
	const page = await browser.newPage();
	await page.goto(url);
	const text = await page.content();
	await page.close();
	return text;
};

export const POST: RequestHandler = async (event) => {
	const req: Req = await event.request.json();
	try {
		if (req.action === Action.Create) {
			const url = req.url ?? '';
			const browser = await puppeteer.launch({
				executablePath: 'chromium',
				headless: 'new',
				args: [
					'--disable-gpu',
					'--disable-dev-shm-usage',
					'--disable-setuid-sandbox',
					'--no-sandbox'
				]
			});
			console.log('Start crawling.');
			let crawled = '';
			try {
				crawled = await crawl(url, browser);
			} catch (e) {
				console.error(e);
				await browser.close();
			}
			await browser.close();
			console.log(crawled);

			const dom = new JSDOM(crawled, { url: url });
			const document = dom.window.document;
			const parsed = new Readability(document).parse();
			if (!parsed) {
				return new Response('Failed to parse the document.', {
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
					`./prisma/databases/.index/${id}`,
					`${parsed.title}\n${parsed.textContent}`
				);
			} catch (e) {
				return new Response(e as string, {
					status: 500
				});
			}

			return new Response(null, {
				status: 201
			});
		}
		if (req.action === Action.ToggleLiked) {
			if (!req.current) {
				return new Response(null, {
					status: 400
				});
			}
			await prisma.articles.update({
				where: { id: req.id },
				data: {
					liked: 1 - req.current
				}
			});
		} else if (req.action === Action.ToggleArchived) {
			if (!req.current) {
				return new Response(null, {
					status: 400
				});
			}
			await prisma.articles.update({
				where: { id: req.id },
				data: {
					archived: 1 - req.current
				}
			});
		} else if (req.action === Action.UpdatePosition) {
			await prisma.articles.update({
				where: { id: req.id },
				data: {
					position: req.pos as number,
					progress: req.prog as number
				}
			});
		} else {
			await prisma.articles.delete({
				where: { id: req.id }
			});
			await fs.rm(`${process.env.LEAF_DATA ?? './prisma/databases/'}.index/${req.id}`);
		}
		return new Response(null, {
			status: 200
		});
	} catch (e) {
		return new Response(e as string, {
			status: 500
		});
	}
};
