// src/pages/api/payment/verify.ts
import { NextApiResponse } from 'next';
import crypto from 'crypto';
import { prisma } from '../../../lib/prisma';
import { withAuth, AuthenticatedRequest } from '../../../middleware/auth';

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const {
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
    deliveryId
  } = req.body;

  try {
    // Verify signature
    const sign = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSign = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
      .update(sign.toString())
      .digest('hex');

    if (razorpay_signature !== expectedSign) {
      return res.status(400).json({ error: 'Invalid payment signature' });
    }

    // Update delivery payment status
    const delivery = await prisma.delivery.update({
      where: { id: Number(deliveryId) },
      data: {
        paymentStatus: 'COMPLETED',
        paymentId: razorpay_payment_id
      },
      include: {
        borrowRequest: {
          include: {
            book: true,
            borrower: { select: { id: true, name: true } }
          }
        }
      }
    });

    res.json({
      success: true,
      message: 'Payment verified successfully',
      delivery,
      verificationCode: delivery.verificationCode
    });
  } catch (error: any) {
    console.error('Payment verification error:', error);
    res.status(500).json({ error: 'Payment verification failed' });
  }
}

export default withAuth(handler);