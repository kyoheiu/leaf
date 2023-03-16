import { NextApiRequest, NextApiResponse } from "next";
import { createArticle } from "./articles";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method === "POST") {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Method", "POST");
    const query = req.query;
    if (query.url) {
      const response = await createArticle(query.url as string);
      if (!response.ok) {
        res.send(response.body);
      } else {
        res.status(200).end();
      }
    }
  } else {
    res.status(404).end();
  }
}
