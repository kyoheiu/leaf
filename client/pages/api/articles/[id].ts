import type { NextApiRequest, NextApiResponse } from "next";

export const getArticleContent = async (id: string) => {
  const target = `http://${process.env.NEXT_PUBLIC_HOST}:8000/articles/${id}`;
  const res = await fetch(target);
  const data = await res.json();
  return data;
};

const toggleStatus = async (id: string, toggle: string) => {
  return await fetch(
    `http://${process.env.NEXT_PUBLIC_HOST}:8000/articles/${id}?toggle=${toggle}`,
    { method: "POST" }
  );
};

const manageTag = async (id: string, kind: string, tag: string) => {
  return await fetch(
    `http://${process.env.NEXT_PUBLIC_HOST}:8000/articles/${id}?kind=${kind}`,
    {
      method: "POST",
      body: tag,
    }
  );
};

const deleteArticle = async (id: string) => {
  return await fetch(
    `http://${process.env.NEXT_PUBLIC_HOST}:8000/articles/${id}`,
    {
      method: "DELETE",
    }
  );
};

const updateProgress = async (id: string, pos: string, prog: string) => {
  const target = `http://${process.env.NEXT_PUBLIC_HOST}:8000/articles/${id}?pos=${pos}&prog=${prog}`;
  return await fetch(target, { method: "POST" });
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const query = req.query;
  if (req.method === "GET") {
    const data = await getArticleContent(query.id as string);
    return res.json(data);
  } else if (req.method === "POST") {
    if (query.pos) {
      const response = await updateProgress(
        query.id as string,
        query.pos as string,
        query.prog as string
      );
      if (!response.ok) {
        res.status(404).end();
      } else {
        res.status(200).end();
      }
    } else if (query.toggle) {
      const response = await toggleStatus(
        query.id as string,
        query.toggle as string
      );
      if (!response.ok) {
        return res.status(404).end();
      } else {
        return res.status(200).end();
      }
    } else if (query.kind) {
      const tag = req.body;
      const response = await manageTag(
        query.id as string,
        query.kind as string,
        tag
      );
      if (!response.ok) {
        res.status(500).send(response.status);
      } else {
        res.status(200).end();
      }
    }
  } else if (req.method === "DELETE") {
    const response = await deleteArticle(query.id as string);
    if (!response.ok) {
      res.status(404).end();
    } else {
      res.status(200).end();
    }
  } else {
    res.status(404).end();
  }
}
