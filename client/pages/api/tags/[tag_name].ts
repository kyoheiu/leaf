import type { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "next-auth/react";

export const getTagList = async (tag_name: string) => {
  const target = `http://${process.env.NEXT_PUBLIC_HOST}:8000/tags/${tag_name}`;
  const res = await fetch(target);
  const data = await res.json();
  return data;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await getSession({ req });
  const { tag_name } = req.query;

  if (!session || req.method !== "GET") {
    res.status(404).end();
  } else {
    const data = await getTagList(tag_name as string);
    return res.json(data);
  }
}
