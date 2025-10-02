import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../lib/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "POST") {
    const { bookId, borrowerId, ownerId } = req.body;
    try {
      const request = await prisma.borrowRequest.create({
        data: { bookId, borrowerId, ownerId },
      });
      res.status(201).json(request);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }

  if (req.method === "PUT") {
    const { id, action } = req.body;
    try {
      if (action === "accept") {
        const request = await prisma.borrowRequest.update({
          where: { id: Number(id) },
          data: { status: "accepted" },
        });

        await prisma.book.update({
          where: { id: request.bookId },
          data: { userId: request.borrowerId, status: "borrowed" },
        });

        return res.json(request);
      }

      if (action === "return") {
        const request = await prisma.borrowRequest.update({
          where: { id: Number(id) },
          data: { status: "completed" },
        });

        await prisma.book.update({
          where: { id: request.bookId },
          data: { userId: request.ownerId, status: "available" },
        });

        return res.json(request);
      }
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }
}
