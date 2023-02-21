import type { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "next-auth/react";

interface Content {
  url: string;
  html: string;
}

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
