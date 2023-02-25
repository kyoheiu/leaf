import type { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "next-auth/react";

interface Content {
  url: string;
  html: string;
  title: string;
  plain: string;
  og: string | null | undefined;
}

export const getArchivedArticles = async () => {
  const response = await fetch(
    `http://${process.env.NEXT_PUBLIC_HOST}:8000/articles/archived`
  );
  const data = await response.json();
  return data;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await getSession({ req });

  if (!session) {
    res.status(404).end();
  } else {
    if (req.method === "GET") {
      const data = await getArchivedArticles();
      return res.json(data);
    }
  }
}
