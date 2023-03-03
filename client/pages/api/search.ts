import { authOptions } from "./auth/[...nextauth]";
import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";

export const searchArticles = async (query: string | string[]) => {
  const target = `http://${process.env.NEXT_PUBLIC_HOST}:8000/search?q=${query}`;
  const response = await fetch(target);
  const data = await response.json();
  return data;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await getServerSession(req, res, authOptions);

  if (!session || req.method !== "POST") {
    res.status(404).end();
  } else {
    const query = req.query;
    if (!query.q) {
      res.status(404).end();
    } else {
      const data = await searchArticles(query.q);
      return res.json(data);
    }
  }
}
