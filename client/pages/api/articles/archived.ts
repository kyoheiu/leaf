import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/auth";

export const getArchivedArticles = async () => {
  const response = await fetch(
    `http://${process.env.NEXT_PUBLIC_HOST}:8000/articles/archived`
  );
  const data = await response.json();
  return data;
};

export const reloadArchivedArticles = async (page: string) => {
  const response = await fetch(
    `http://${process.env.NEXT_PUBLIC_HOST}:8000/articles/archived?page=${page}`
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
      const data = await getArchivedArticles();
      return res.json(data);
    } else {
      const data = await reloadArchivedArticles(query.reload as string);
      return res.json(data);
    }
  } else {
    res.status(404).end();
  }
}
