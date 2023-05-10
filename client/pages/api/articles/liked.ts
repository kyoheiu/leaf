import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/auth";

export const getLikedArticles = async () => {
  const response = await fetch(
    `http://${process.env.NEXT_PUBLIC_HOST}:8000/articles/liked`
  );
  const data = await response.json();
  return data;
};

export const reloadLikedArticles = async (page: string) => {
  const response = await fetch(
    `http://${process.env.NEXT_PUBLIC_HOST}:8000/articles/liked?page=${page}`
  );
  const data = await response.json();
  return data;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  //Check the cookie if env variable is set
  if (process.env.GITHUB_CLIENT_ID) {
    const session = await getServerSession(req, res, authOptions);
    if (!session) {
      res.status(303).setHeader("Location", "/").end();
    }
  }

  if (req.method === "GET") {
    const query = req.query;
    if (!query.reload) {
      const data = await getLikedArticles();
      return res.json(data);
    } else {
      const data = await reloadLikedArticles(query.reload as string);
      return res.json(data);
    }
  } else {
    res.status(404).end();
  }
}
