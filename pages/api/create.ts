import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    res.status(404).end();
  } else {
    let url: string = JSON.stringify(req.body);
    url = url.slice(4);
    const response = await fetch("http://localhost:8000/articles", {
      method: "POST",
      body: url,
    });
    if (!response.ok) {
      console.log("Cannot create new article.");
    }

    res.status(303).setHeader("Location", "/").end();
  }
}
