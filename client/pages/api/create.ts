import { NextApiRequest, NextApiResponse } from "next";
import NextCors from "nextjs-cors";
import { createArticle } from "./articles";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  await NextCors(req, res, {
    methods: ["OPTIONS", "POST"],
    origin: "*",
    preflightContinue: false,
    optionSuccessStatus: 200,
  });

  if (
    req.method === "POST" &&
    req.headers.authorization === process.env.LEAF_API_TOKEN
  ) {
    const body = req.body;
    if (body.url) {
      const response = await createArticle(body.url as string);
      if (!response.ok) {
        res.status(500).end();
      } else {
        res.status(200).end();
      }
    }
  } else {
    res.status(404).end();
  }
}
