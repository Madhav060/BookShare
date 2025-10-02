// src/pages/books/[id].tsx
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import api from '../../utils/api';
import Layout from '../../components/Layout';
import { useAuth } from '../../context/AuthContext';
import { Book } from '../../types';

export default function BookDetails() {
  const [book, setBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(true);
  const [requesting, setRequesting] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const { id } = router.query;
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    if (id) {
      loadBook();
    }
  }, [id]);

  const loadBook = async () => {
    try {
      const res = await api.get('/books');
      const foundBook = res.data.find((b: Book) => b.id === Number(id));
      
      if (foundBook) {
        setBook(foundBook);
      } else {
        setError('Book not found');
      }
    } catch (err) {
      console.error('Error loading book:', err);
      setError('Failed to load book');
    } finally {
      setLoading(false);
    }
  };

  const handleBorrowRequest = async () => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    setRequesting(true);
    setError('');

    try {
      await api.post('/borrow/request', { bookId: book?.id });
      alert('Borrow request sent successfully!');
      router.push('/requests');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to send borrow request');
    } finally {
      setRequesting(false);
    }
  };

  if (loading) {
    return <Layout><p>Loading book details...</p></Layout>;
  }

  if (error || !book) {
    return (
      <Layout>
        <div style={{ padding: '40px', textAlign: 'center' }}>
          <p style={{ color: '#e74c3c' }}>{error || 'Book not found'}</p>
          <a 
            href="/"
            style={{
              display: 'inline-block',
              marginTop: '15px',
              padding: '10px 20px',
              background: '#3498db',
              color: 'white',
              textDecoration: 'none',
              borderRadius: '4px'
            }}
          >
            Back to Home
          </a>
        </div>
      </Layout>
    );
  }

  const isOwner = user?.id === book.ownerId;

  return (
    <Layout>
      <div style={{ maxWidth: '600px', margin: '50px auto' }}>
        <div style={{
          border: '1px solid #ddd',
          borderRadius: '8px',
          padding: '30px',
          background: 'white',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
        }}>
          <h1 style={{ marginTop: 0, color: '#2c3e50' }}>{book.title}</h1>
          <p style={{ fontSize: '18px', color: '#7f8c8d', marginBottom: '20px' }}>
            by {book.author}
          </p>

          <div style={{ marginBottom: '20px' }}>
            <strong>Owner:</strong> {book.owner?.name}
          </div>

          <div style={{ marginBottom: '20px' }}>
            <strong>Status:</strong>{' '}
            <span style={{ 
              color: book.status === 'AVAILABLE' ? '#27ae60' : '#f39c12' 
            }}>
              {book.status === 'AVAILABLE' ? 'Available' : 'Borrowed'}
            </span>
          </div>

          {book.status === 'BORROWED' && book.holder && (
            <div style={{ marginBottom: '20px' }}>
              <strong>Currently held by:</strong> {book.holder.name}
            </div>
          )}

          {error && (
            <div style={{ 
              padding: '10px', 
              background: '#ffebee', 
              color: '#c62828', 
              borderRadius: '4px',
              marginBottom: '20px'
            }}>
              {error}
            </div>
          )}

          {!isOwner && book.status === 'AVAILABLE' && (
            <button
              onClick={handleBorrowRequest}
              disabled={requesting}
              style={{
                width: '100%',
                padding: '12px',
                background: '#2ecc71',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                fontSize: '16px',
                cursor: requesting ? 'not-allowed' : 'pointer',
                opacity: requesting ? 0.7 : 1
              }}
            >
              {requesting ? 'Sending Request...' : '📖 Request to Borrow'}
            </button>
          )}

          {isOwner && (
            <div style={{ 
              padding: '15px', 
              background: '#e8f5e9', 
              borderRadius: '4px',
              textAlign: 'center'
            }}>
              This is your book
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}