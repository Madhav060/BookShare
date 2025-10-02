import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../lib/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "POST") {
    const { title, author, ownerId } = req.body;
    try {
      const book = await prisma.book.create({
        data: { title, author, ownerId, userId: ownerId },
      });
      res.status(201).json(book);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  } else if (req.method === "GET") {
    const books = await prisma.book.findMany({
      include: { owner: true, holder: true },
    });
    res.json(books);
  } else {
    res.status(405).json({ error: "Method not allowed" });
  }
}
