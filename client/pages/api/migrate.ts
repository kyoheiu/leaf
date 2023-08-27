import type { NextApiRequest, NextApiResponse } from "next";

const migrate = async () => {
  await fetch(`http://${process.env.NEXT_PUBLIC_HOST}:8000/migrate`, {
    method: "POST",
  });
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "POST") {
    console.log("Migration.");
    const _response = await migrate();
    res.status(200).end();
  } else {
    res.status(404).end();
  }
}
