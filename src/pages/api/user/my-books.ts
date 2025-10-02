// src/pages/api/user/my-books.ts
import { NextApiResponse } from 'next';
import { prisma } from '../../../lib/prisma';
import { withAuth, AuthenticatedRequest } from '../../../middleware/auth';

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const books = await prisma.book.findMany({
      where: {
        ownerId: req.userId
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
    console.error('Get my books error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export default withAuth(handler);