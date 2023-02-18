import { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "next-auth/react";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await getSession({ req });

  if (!session || req.method !== "POST") {
    res.status(404).end();
  } else {
    console.log(req.body);
    let id: string = req.body;

    const response = await fetch(
      `http://${process.env.NEXT_PUBLIC_HOST}:8000/articles/${id}?toggle=archived`,
      { method: "POST" }
    );

    if (!response.ok) {
      return res.status(404).end();
    } else {
      return res.status(200).end();
    }
  }
}
