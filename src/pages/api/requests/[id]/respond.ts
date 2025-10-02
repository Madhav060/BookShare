// src/pages/api/requests/[id]/respond.ts
import { NextApiResponse } from 'next';
import { prisma } from '../../../../lib/prisma';
import { withAuth, AuthenticatedRequest } from '../../../../middleware/auth';

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  if (req.method !== 'PATCH') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { id } = req.query;
  const { action } = req.body;

  if (!action || !['ACCEPT', 'REJECT'].includes(action)) {
    return res.status(400).json({ error: 'Invalid action. Must be ACCEPT or REJECT' });
  }

  try {
    // Find the borrow request and include the book to verify the owner
    const request = await prisma.borrowRequest.findUnique({
      where: { id: Number(id) },
      include: {
        book: true
      }
    });

    if (!request) {
      return res.status(404).json({ error: 'Request not found' });
    }

    if (request.book.ownerId !== req.userId) {
      return res.status(403).json({ 
        error: 'You can only respond to requests for your own books' 
      });
    }

    if (request.status !== 'PENDING') {
      return res.status(400).json({ 
        error: 'This request has already been responded to' 
      });
    }

    // Process the action
    if (action === 'ACCEPT') {
      // Use a transaction to ensure both updates succeed or fail together
      const [updatedRequest] = await prisma.$transaction([
        // Update the BorrowRequest
        prisma.borrowRequest.update({
          where: { id: Number(id) },
          data: { status: 'ACCEPTED' },
          include: {
            book: {
              include: {
                owner: { select: { id: true, name: true, email: true } },
                holder: { select: { id: true, name: true, email: true } }
              }
            },
            borrower: { select: { id: true, name: true, email: true } }
          }
        }),
        // Update the Book's status and current holder
        prisma.book.update({
          where: { id: request.bookId },
          data: {
            status: 'BORROWED',
            userId: request.borrowerId
          }
        })
      ]);

      return res.status(200).json({
        message: 'Request accepted successfully',
        request: updatedRequest
      });
    } else if (action === 'REJECT') {
      const updatedRequest = await prisma.borrowRequest.update({
        where: { id: Number(id) },
        data: { status: 'REJECTED' },
        include: {
          book: {
            include: {
              owner: { select: { id: true, name: true, email: true } },
              holder: { select: { id: true, name: true, email: true } }
            }
          },
          borrower: { select: { id: true, name: true, email: true } }
        }
      });

      return res.status(200).json({
        message: 'Request rejected successfully',
        request: updatedRequest
      });
    }
  } catch (error: any) {
    console.error('Error responding to request:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export default withAuth(handler);