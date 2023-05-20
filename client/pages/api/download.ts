import { NextApiRequest, NextApiResponse } from "next";

const download = async () => {
  const res = await fetch(`http://${process.env.NEXT_PUBLIC_HOST}:8000/export`);
  return await res.json();
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "GET") {
    const json = await download();
    res.setHeader("Content-Disposition", "attachment; filename=export.json");
    res.setHeader("Content-Type", "application/json");
    res.send(json);
  } else {
    res.status(404).end();
  }
}
