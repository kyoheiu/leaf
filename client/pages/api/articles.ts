import type { NextApiRequest, NextApiResponse } from "next";

export const getArticles = async () => {
  const response = await fetch(
    `http://${process.env.NEXT_PUBLIC_HOST}:8000/articles`
  );
  const data = await response.json();
  return data;
};

export const reloadArticles = async (page: string) => {
  const response = await fetch(
    `http://${process.env.NEXT_PUBLIC_HOST}:8000/articles?page=${page}`
  );
  const data = await response.json();
  return data;
};

export const createArticle = async (url: string) => {
  return await fetch(`http://${process.env.NEXT_PUBLIC_HOST}:8000/articles`, {
    method: "POST",
    body: url,
  });
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "GET") {
    const query = req.query;
    if (!query.page) {
      const data = await getArticles();
      return res.json(data);
    } else {
      const data = await reloadArticles(query.page as string);
      return res.json(data);
    }
  } else if (req.method === "POST") {
    const url: string = req.body;
    const response = await createArticle(url);
    if (!response.ok) {
      res.send(response.body);
    } else {
      res.status(303).setHeader("Location", "/").end();
    }
  } else {
    res.status(404).end();
  }
}
