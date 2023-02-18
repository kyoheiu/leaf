import { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "next-auth/react";
import puppeteer from "puppeteer";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await getSession({ req });

  if (!session || req.method !== "GET") {
    res.status(404).end();
  } else {
    console.log(req.body);
    let id: string = req.body;

    const response = await fetch(
      `http://${process.env.NEXT_PUBLIC_HOST}:8000/articles?reload=${id}`
    );
    const j = await response.json();
    res.status(200).json(j);
  }
}
