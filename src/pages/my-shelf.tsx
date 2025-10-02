// src/pages/my-shelf.tsx
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import api from '../utils/api';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';
import { Book } from '../types';

export default function MyShelf() {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    loadBooks();
  }, [isAuthenticated]);

  const loadBooks = async () => {
    try {
      const res = await api.get('/user/my-books');
      setBooks(res.data);
    } catch (err) {
      console.error('Error loading books:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) return null;

  if (loading) {
    return <Layout><p>Loading your books...</p></Layout>;
  }

  return (
    <Layout>
      <div>
        <h1>📚 My Shelf</h1>
        <p style={{ color: '#666', marginBottom: '20px' }}>
          Manage your book collection
        </p>

        {books.length === 0 ? (
          <div style={{ 
            padding: '40px', 
            textAlign: 'center', 
            background: '#f8f9fa', 
            borderRadius: '8px' 
          }}>
            <p>You haven't added any books yet.</p>
            <a 
              href="/add-book"
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
              Add Your First Book
            </a>
          </div>
        ) : (
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', 
            gap: '20px' 
          }}>
            {books.map((book) => (
              <div
                key={book.id}
                style={{
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  padding: '20px',
                  background: 'white',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                }}
              >
                <h3 style={{ marginTop: 0, color: '#2c3e50' }}>{book.title}</h3>
                <p style={{ color: '#7f8c8d', fontSize: '14px' }}>
                  by {book.author}
                </p>
                <div style={{ 
                  marginTop: '15px', 
                  padding: '8px', 
                  background: book.status === 'AVAILABLE' ? '#d4edda' : '#fff3cd',
                  color: book.status === 'AVAILABLE' ? '#155724' : '#856404',
                  borderRadius: '4px',
                  fontSize: '14px',
                  textAlign: 'center'
                }}>
                  {book.status === 'AVAILABLE' ? '✓ Available' : '📤 Borrowed'}
                </div>
                {book.status === 'BORROWED' && book.holder && (
                  <p style={{ 
                    marginTop: '10px', 
                    fontSize: '12px', 
                    color: '#95a5a6' 
                  }}>
                    Currently held by: {book.holder.name}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}