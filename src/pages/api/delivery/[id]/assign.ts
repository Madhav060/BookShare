// src/pages/api/delivery/[id]/assign.ts - COMPLETE & FIXED
import { NextApiResponse } from 'next';
import { prisma } from '../../../../lib/prisma';
import { withAuth, AuthenticatedRequest } from '../../../../middleware/auth';
import { notifyDeliveryAssigned } from '../../../../lib/notifications';

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  if (req.method !== 'PATCH') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { id } = req.query;

  // Check if user is a delivery agent
  if (req.user?.role !== 'DELIVERY_AGENT') {
    return res.status(403).json({ 
      error: 'Access denied. Delivery agent role required.' 
    });
  }

  try {
    // Find the delivery
    const delivery = await prisma.delivery.findUnique({
      where: { id: Number(id) },
      include: {
        borrowRequest: {
          include: {
            borrower: { select: { id: true, name: true } },
            book: {
              include: {
                owner: { select: { id: true, name: true } }
              }
            }
          }
        }
      }
    });

    if (!delivery) {
      return res.status(404).json({ error: 'Delivery not found' });
    }

    if (delivery.status !== 'PENDING') {
      return res.status(400).json({ 
        error: 'This delivery has already been assigned' 
      });
    }

    if (delivery.agentId !== null) {
      return res.status(400).json({ 
        error: 'This delivery is already assigned to another agent' 
      });
    }

    // Assign the delivery to the agent
    const updatedDelivery = await prisma.delivery.update({
      where: { id: Number(id) },
      data: {
        agentId: req.userId,
        status: 'ASSIGNED'
      },
      include: {
        agent: { select: { id: true, name: true, email: true } },
        borrowRequest: {
          include: {
            book: {
              include: {
                owner: { select: { id: true, name: true, email: true } }
              }
            },
            borrower: { select: { id: true, name: true, email: true } }
          }
        }
      }
    });

    // Send notifications to borrower and owner
    try {
      await notifyDeliveryAssigned(
        delivery.borrowRequest.borrowerId,
        req.user!.name,
        updatedDelivery.id
      );
      await notifyDeliveryAssigned(
        delivery.borrowRequest.book.ownerId,
        req.user!.name,
        updatedDelivery.id
      );
    } catch (notifError) {
      console.error('Error sending notifications:', notifError);
      // Don't fail the request if notifications fail
    }

    res.json({
      message: 'Delivery assigned successfully',
      delivery: updatedDelivery
    });
  } catch (error: any) {
    console.error('Assign delivery error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export default withAuth(handler);