// src/pages/api/delivery/[id]/verify.ts
import { NextApiResponse } from 'next';
import { prisma } from '../../../../lib/prisma';
import { withAuth, AuthenticatedRequest } from '../../../../middleware/auth';

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { id } = req.query;
  const { verificationCode } = req.body;

  if (!verificationCode) {
    return res.status(400).json({ error: 'Verification code is required' });
  }

  try {
    // Find the delivery
    const delivery = await prisma.delivery.findUnique({
      where: { id: Number(id) },
      include: {
        borrowRequest: {
          include: {
            book: true,
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
        error: 'Only the assigned agent can verify delivery' 
      });
    }

    // Check if already verified
    if (delivery.codeVerifiedAt) {
      return res.status(400).json({ 
        error: 'Delivery code already verified' 
      });
    }

    // Verify the code
    if (delivery.verificationCode !== verificationCode.toString()) {
      return res.status(400).json({ 
        error: 'Invalid verification code' 
      });
    }

    // Update delivery as verified
    const updatedDelivery = await prisma.delivery.update({
      where: { id: Number(id) },
      data: {
        codeVerifiedAt: new Date()
      },
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

    res.json({
      message: 'Verification successful! You can now proceed with pickup.',
      delivery: updatedDelivery,
      verified: true
    });
  } catch (error: any) {
    console.error('Verify delivery error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export default withAuth(handler);