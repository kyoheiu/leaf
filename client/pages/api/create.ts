import { NextApiRequest, NextApiResponse } from "next";
import { createArticle } from "./articles";

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse,
) {
	if (req.method === "POST") {
		const response = await createArticle(req.body.url);
		if (!response.ok) {
			res.send(response.body);
		} else {
			res.status(200).end();
		}
	}
}
