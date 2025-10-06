// src/pages/api/delivery/[id]/status.ts - UPDATE STATUS WITH VALIDATION
import { NextApiResponse } from 'next';
import { prisma } from '../../../../lib/prisma';
import { withAuth, AuthenticatedRequest } from '../../../../middleware/auth';
import { notifyDeliveryPickedUp, notifyDeliveryCompleted } from '../../../../lib/notifications';

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  if (req.method !== 'PATCH') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { id } = req.query;
  const { status, trackingNotes } = req.body;

  if (!status) {
    return res.status(400).json({ error: 'Status is required' });
  }

  const validStatuses = [
    'PICKUP_SCHEDULED',
    'PICKED_UP',
    'IN_TRANSIT',
    'DELIVERED',
    'COMPLETED',
    'CANCELLED'
  ];

  if (!validStatuses.includes(status)) {
    return res.status(400).json({ 
      error: 'Invalid status',
      validStatuses 
    });
  }

  try {
    // Find the delivery
    const delivery = await prisma.delivery.findUnique({
      where: { id: Number(id) },
      include: {
        borrowRequest: {
          include: {
            book: { select: { id: true, title: true } },
            borrower: { select: { id: true, name: true } }
          }
        }
      }
    });

    if (!delivery) {
      return res.status(404).json({ error: 'Delivery not found' });
    }

    // Check if user is the assigned agent
    if (delivery.agentId !== req.userId) {
      return res.status(403).json({ 
        error: 'Only the assigned agent can update delivery status' 
      });
    }

    // Check if payment is completed
    if (delivery.paymentStatus !== 'COMPLETED') {
      return res.status(400).json({ 
        error: 'Cannot update status until payment is completed' 
      });
    }

    // Check if code is verified for pickup/transit statuses
    if (['PICKED_UP', 'IN_TRANSIT'].includes(status) && !delivery.codeVerifiedAt) {
      return res.status(400).json({ 
        error: 'Verification code must be validated before pickup' 
      });
    }

    // Prepare update data
    const updateData: any = {
      status,
      trackingNotes: trackingNotes || delivery.trackingNotes
    };

    // Set timestamps based on status
    if (status === 'PICKED_UP' && !delivery.pickupCompleted) {
      updateData.pickupCompleted = new Date();
    } else if (status === 'DELIVERED' && !delivery.deliveryCompleted) {
      updateData.deliveryCompleted = new Date();
    }

    // Update delivery
    const updatedDelivery = await prisma.delivery.update({
      where: { id: Number(id) },
      data: updateData,
      include: {
        agent: { select: { id: true, name: true } },
        borrowRequest: {
          include: {
            book: true,
            borrower: { select: { id: true, name: true } }
          }
        }
      }
    });

    // Send notifications based on status
    try {
      if (status === 'PICKED_UP') {
        await notifyDeliveryPickedUp(
          delivery.borrowRequest.borrowerId,
          delivery.borrowRequest.book.title,
          delivery.id
        );
      } else if (status === 'DELIVERED') {
        await notifyDeliveryCompleted(
          delivery.borrowRequest.borrowerId,
          delivery.borrowRequest.book.title,
          delivery.id
        );
      }
    } catch (notifError) {
      console.error('Error sending notifications:', notifError);
      // Don't fail the request if notifications fail
    }

    res.json({
      message: 'Status updated successfully',
      delivery: updatedDelivery
    });
  } catch (error: any) {
    console.error('Update status error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export default withAuth(handler);