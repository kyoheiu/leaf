import { NextApiRequest, NextApiResponse } from "next";
import { createArticle } from "./articles";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method === "POST") {
    let url: string = req.body;
    const response = await createArticle(url);
    if (!response.ok) {
      res.send(response.body);
    } else {
      res.status(200).end();
    }
  } else {
    res.status(404).end();
  }
}

