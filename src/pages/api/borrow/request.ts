// src/pages/api/borrow/request.ts
import { NextApiResponse } from 'next';
import { prisma } from '../../../lib/prisma';
import { withAuth, AuthenticatedRequest } from '../../../middleware/auth';

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { bookId } = req.body;

  if (!bookId) {
    return res.status(400).json({ error: 'Book ID is required' });
  }

  try {
    // Check if book exists and is available
    const book = await prisma.book.findUnique({
      where: { id: Number(bookId) }
    });

    if (!book) {
      return res.status(404).json({ error: 'Book not found' });
    }

    if (book.status !== 'AVAILABLE') {
      return res.status(400).json({ error: 'Book is not available for borrowing' });
    }

    if (book.ownerId === req.userId) {
      return res.status(400).json({ error: 'You cannot borrow your own book' });
    }

    // Check if user already has a pending or accepted request for this book
    const existingRequest = await prisma.borrowRequest.findFirst({
      where: {
        bookId: Number(bookId),
        borrowerId: req.userId,
        status: {
          in: ['PENDING', 'ACCEPTED']
        }
      }
    });

    if (existingRequest) {
      return res.status(400).json({ 
        error: 'You already have a pending or active request for this book' 
      });
    }

    // Create borrow request
    const borrowRequest = await prisma.borrowRequest.create({
      data: {
        bookId: Number(bookId),
        borrowerId: req.userId!,
        status: 'PENDING'
      },
      include: {
        book: {
          include: {
            owner: {
              select: { id: true, name: true, email: true }
            }
          }
        },
        borrower: {
          select: { id: true, name: true, email: true }
        }
      }
    });

    res.status(201).json(borrowRequest);
  } catch (error: any) {
    console.error('Create borrow request error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export default withAuth(handler);