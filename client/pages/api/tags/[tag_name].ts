import { authOptions } from "../auth/[...nextauth]";
import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";

export const getTagList = async (tag_name: string) => {
  const target = `http://${process.env.NEXT_PUBLIC_HOST}:8000/tags/${tag_name}`;
  const res = await fetch(target);
  const data = await res.json();
  return data;
};

const reloadTagList = async (id: string, tag_name: string) => {
  const target = `http://${process.env.NEXT_PUBLIC_HOST}:8000/tags/${tag_name}?reload=${id}`;
  const res = await fetch(target);
  const data = await res.json();
  return data;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await getServerSession(req, res, authOptions);
  const query = req.query;

  if (!session || req.method !== "GET") {
    res.status(404).end();
  } else {
    if (query.reload) {
      const data = await reloadTagList(
        query.reload as string,
        query.tag_name as string
      );
      return res.json(data);
    }
    const data = await getTagList(query.tag_name as string);
    return res.json(data);
  }
}
