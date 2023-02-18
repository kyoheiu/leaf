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
    let id: string = req.body;
    console.log(id);

    const response = await fetch(
      `http://${process.env.NEXT_PUBLIC_HOST}:8000/articles/${id}?toggle=liked`,
      { method: "POST" }
    );

    if (!response.ok) {
      res.status(404).end();
    } else {
      res.status(200).end();
    }
  }
}
