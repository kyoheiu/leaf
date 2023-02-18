import { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "next-auth/react";

interface tagInfo {
  id: string;
  tag: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await getSession({ req });

  if (!session || req.method !== "POST") {
    res.status(404).end();
  } else {
    let data: tagInfo = req.body;
    console.log(data.tag);

    const response = await fetch(
      `http://${process.env.NEXT_PUBLIC_HOST}:8000/articles/${data.id}?kind=add`,
      {
        method: "POST",
        body: data.tag,
      }
    );

    if (!response.ok) {
      res.status(500).send(response.body);
    } else {
      res.status(200).end();
    }
  }
}
