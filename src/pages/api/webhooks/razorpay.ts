// src/pages/api/webhooks/razorpay.ts
import { NextApiRequest, NextApiResponse } from 'next';
import crypto from 'crypto';
import { prisma } from '../../../lib/prisma';

export const config = {
  api: {
    bodyParser: false,
  },
};

async function buffer(req: NextApiRequest) {
  const chunks = [];
  for await (const chunk of req) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
  }
  return Buffer.concat(chunks).toString('utf8');
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const body = await buffer(req);
    const signature = req.headers['x-razorpay-signature'] as string;

    // Verify webhook signature
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET!)
      .update(body)
      .digest('hex');

    if (signature !== expectedSignature) {
      return res.status(400).json({ error: 'Invalid signature' });
    }

    const event = JSON.parse(body);

    // Handle different events
    switch (event.event) {
      case 'payment.captured':
        // Payment successful
        const paymentId = event.payload.payment.entity.id;
        const orderId = event.payload.payment.entity.order_id;
        
        // Find delivery by order ID and update
        const delivery = await prisma.delivery.findFirst({
          where: { paymentId: orderId }
        });

        if (delivery) {
          await prisma.delivery.update({
            where: { id: delivery.id },
            data: {
              paymentStatus: 'COMPLETED',
              paymentId: paymentId
            }
          });
        }
        break;

      case 'payment.failed':
        // Payment failed
        const failedOrderId = event.payload.payment.entity.order_id;
        
        const failedDelivery = await prisma.delivery.findFirst({
          where: { paymentId: failedOrderId }
        });

        if (failedDelivery) {
          await prisma.delivery.update({
            where: { id: failedDelivery.id },
            data: { paymentStatus: 'FAILED' }
          });
        }
        break;
    }

    res.json({ received: true });
  } catch (error: any) {
    console.error('Webhook error:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
}