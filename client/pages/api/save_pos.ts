import { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "next-auth/react";

interface Progress {
  id: string;
  pos: number;
  prog: number;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await getSession({ req });

  if (!session || req.method !== "POST") {
    res.status(404).end();
  } else {
    let p: Progress = req.body;

    const target = `http://${process.env.NEXT_PUBLIC_HOST}:8000/articles/${p.id}?pos=${p.pos}&prog=${p.prog}`;
    const response = await fetch(target, { method: "POST" });

    if (!response.ok) {
      res.status(404).end();
    } else {
      res.status(200).end();
    }
  }
}
