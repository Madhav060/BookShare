// src/pages/api/books/[id]/upload-cover.ts
import { NextApiResponse } from 'next';
import { prisma } from '../../../../lib/prisma';
import { withAuth, AuthenticatedRequest } from '../../../../middleware/auth';
import { parseForm, saveUploadedFile, deleteUploadedFile } from '../../../../lib/fileUpload';

// IMPORTANT: Disable Next.js body parsing for file uploads
export const config = {
  api: {
    bodyParser: false,
  },
};

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { id } = req.query;

  try {
    // Check if book exists and user owns it
    const book = await prisma.book.findUnique({
      where: { id: Number(id) }
    });

    if (!book) {
      return res.status(404).json({ error: 'Book not found' });
    }

    if (book.ownerId !== req.userId) {
      return res.status(403).json({ error: 'You can only upload covers for your own books' });
    }

    // Parse form data
    const { files } = await parseForm(req);
    
    // Get the uploaded file
    const coverFile = Array.isArray(files.cover) ? files.cover[0] : files.cover;
    
    if (!coverFile) {
      return res.status(400).json({ error: 'No cover image provided' });
    }

    // Save the file and get public URL
    const coverUrl = saveUploadedFile(coverFile);

    // Delete old cover if exists
    if (book.coverImage) {
      deleteUploadedFile(book.coverImage);
    }

    // Update book with new cover URL
    const updatedBook = await prisma.book.update({
      where: { id: Number(id) },
      data: { coverImage: coverUrl },
      include: {
        owner: { select: { id: true, name: true, email: true } },
        holder: { select: { id: true, name: true, email: true } }
      }
    });

    res.json({
      message: 'Cover image uploaded successfully',
      book: updatedBook,
      coverUrl
    });
  } catch (error: any) {
    console.error('Upload cover error:', error);
    res.status(500).json({ error: 'Failed to upload cover image' });
  }
}

export default withAuth(handler);