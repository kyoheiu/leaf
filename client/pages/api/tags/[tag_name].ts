import type { NextApiRequest, NextApiResponse } from "next";

export const getTagList = async (tag_name: string) => {
  const target = `http://${process.env.NEXT_PUBLIC_HOST}:8000/tags/${tag_name}`;
  const res = await fetch(target);
  const data = await res.json();
  return data;
};

export const reloadTagList = async (tag_name: string, page: string) => {
  const target = `http://${process.env.NEXT_PUBLIC_HOST}:8000/tags/${tag_name}?page=${page}`;
  const res = await fetch(target);
  const data = await res.json();
  return data;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "GET") {
    const query = req.query;
    if (query.reload) {
      const data = await reloadTagList(
        query.reload as string,
        query.tag_name as string
      );
      return res.json(data);
    } else {
      const data = await getTagList(query.tag_name as string);
      return res.json(data);
    }
  } else {
    res.status(404).end();
  }
}
