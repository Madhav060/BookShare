// src/pages/api/books/index.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../lib/prisma';
import { withAuth, AuthenticatedRequest } from '../../../middleware/auth';

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { title, author } = req.body;

    if (!title || !author) {
      return res.status(400).json({ error: 'Title and author are required' });
    }

    try {
      const book = await prisma.book.create({
        data: {
          title,
          author,
          ownerId: req.userId!,
          userId: req.userId!, // Initially, holder is owner
          status: 'AVAILABLE'
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
    } catch (error: any) {
      console.error('Create book error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  } else if (req.method === 'GET') {
    try {
      // Get all available books for the home page
      const books = await prisma.book.findMany({
        where: {
          status: 'AVAILABLE'
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
    } catch (error: any) {
      console.error('Get books error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}

export default withAuth(handler);