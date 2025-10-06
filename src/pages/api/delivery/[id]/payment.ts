// src/pages/api/delivery/[id]/payment.ts
import { NextApiResponse } from 'next';
import { prisma } from '../../../../lib/prisma';
import { withAuth, AuthenticatedRequest } from '../../../../middleware/auth';

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { id } = req.query;
  const { paymentMethod } = req.body; // 'card', 'upi', 'wallet'

  try {
    // Find the delivery
    const delivery = await prisma.delivery.findUnique({
      where: { id: Number(id) },
      include: {
        borrowRequest: {
          include: {
            borrower: { select: { id: true } }
          }
        }
      }
    });

    if (!delivery) {
      return res.status(404).json({ error: 'Delivery not found' });
    }

    // Check if user is the borrower
    if (delivery.borrowRequest.borrowerId !== req.userId) {
      return res.status(403).json({ 
        error: 'Only the borrower can make payment' 
      });
    }

    // Check if code is verified
    if (!delivery.codeVerifiedAt) {
      return res.status(400).json({ 
        error: 'Delivery code must be verified before payment' 
      });
    }

    // Check if already paid
    if (delivery.paymentStatus === 'COMPLETED') {
      return res.status(400).json({ 
        error: 'Payment already completed' 
      });
    }

    // DUMMY PAYMENT PROCESSING
    // In real app, integrate with Stripe, Razorpay, etc.
    const paymentId = `PAY_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Simulate payment processing delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Update delivery with payment info
    const updatedDelivery = await prisma.delivery.update({
      where: { id: Number(id) },
      data: {
        paymentStatus: 'COMPLETED',
        paymentId
      }
    });

    res.json({
      message: 'Payment successful!',
      delivery: updatedDelivery,
      payment: {
        id: paymentId,
        amount: delivery.paymentAmount,
        method: paymentMethod,
        status: 'COMPLETED',
        timestamp: new Date()
      }
    });
  } catch (error: any) {
    console.error('Payment error:', error);
    res.status(500).json({ error: 'Payment processing failed' });
  }
}

export default withAuth(handler);