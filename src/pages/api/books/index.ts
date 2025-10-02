// src/pages/api/books/index.ts
import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../../lib/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "POST") {
    const { title, author } = req.body;
    const userId = req.headers['x-user-id']; // Get from session

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    try {
      const book = await prisma.book.create({
        data: {
          title,
          author,
          ownerId: Number(userId),
          userId: Number(userId), // Initially, holder is owner
          status: "AVAILABLE"
        },
        include: {
          owner: {
            select: { id: true, name: true, email: true }
          },
          holder: {
            select: { id: true, name: true, email: true }
          }
        }
      });

      res.status(201).json(book);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  } else if (req.method === "GET") {
    try {
      // Get all available books for the home page
      const books = await prisma.book.findMany({
        where: {
          status: "AVAILABLE"
        },
        include: {
          owner: {
            select: { id: true, name: true, email: true }
          },
          holder: {
            select: { id: true, name: true, email: true }
          }
        },
        orderBy: { createdAt: 'desc' }
      });

      res.json(books);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  } else {
    res.status(405).json({ error: "Method not allowed" });
  }
}