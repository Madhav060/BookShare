// src/pages/my-shelf.tsx
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import api from '../utils/api';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';
import { Book } from '../types';

type TabType = 'owned' | 'borrowed';

export default function MyShelf() {
  const [ownedBooks, setOwnedBooks] = useState<Book[]>([]);
  const [borrowedBooks, setBorrowedBooks] = useState<Book[]>([]);
  const [activeTab, setActiveTab] = useState<TabType>('owned');
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
      setOwnedBooks(res.data.owned);
      setBorrowedBooks(res.data.borrowed);
    } catch (err) {
      console.error('Error loading books:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleBookAction = async (bookId: number, action: 'hide' | 'show' | 'delete') => {
    if (action === 'delete') {
      if (!confirm('Are you sure you want to delete this book? This cannot be undone.')) {
        return;
      }
    }

    try {
      await api.patch(`/books/${bookId}/actions`, { action });
      alert(`Book ${action}d successfully!`);
      loadBooks(); // Reload books
    } catch (err: any) {
      alert(err.response?.data?.error || `Failed to ${action} book`);
    }
  };

  if (!isAuthenticated) return null;

  if (loading) {
    return <Layout><p>Loading your books...</p></Layout>;
  }

  const currentBooks = activeTab === 'owned' ? ownedBooks : borrowedBooks;

  return (
    <Layout>
      <div>
        <h1>📚 My Shelf</h1>

        {/* Tab Navigation */}
        <div style={{ 
          display: 'flex', 
          gap: '10px', 
          marginBottom: '30px',
          borderBottom: '2px solid #ecf0f1'
        }}>
          <button
            onClick={() => setActiveTab('owned')}
            style={{
              padding: '10px 20px',
              background: activeTab === 'owned' ? '#3498db' : 'transparent',
              color: activeTab === 'owned' ? 'white' : '#7f8c8d',
              border: 'none',
              borderBottom: activeTab === 'owned' ? '3px solid #2980b9' : 'none',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: activeTab === 'owned' ? 'bold' : 'normal'
            }}
          >
            My Books ({ownedBooks.length})
          </button>
          <button
            onClick={() => setActiveTab('borrowed')}
            style={{
              padding: '10px 20px',
              background: activeTab === 'borrowed' ? '#3498db' : 'transparent',
              color: activeTab === 'borrowed' ? 'white' : '#7f8c8d',
              border: 'none',
              borderBottom: activeTab === 'borrowed' ? '3px solid #2980b9' : 'none',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: activeTab === 'borrowed' ? 'bold' : 'normal'
            }}
          >
            Borrowed Books ({borrowedBooks.length})
          </button>
        </div>

        {/* Books Display */}
        {currentBooks.length === 0 ? (
          <div style={{ 
            padding: '40px', 
            textAlign: 'center', 
            background: '#f8f9fa', 
            borderRadius: '8px' 
          }}>
            <p>
              {activeTab === 'owned' 
                ? "You haven't added any books yet." 
                : "You're not currently borrowing any books."}
            </p>
            {activeTab === 'owned' && (
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
            )}
          </div>
        ) : (
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', 
            gap: '20px' 
          }}>
            {currentBooks.map((book) => (
              <div
                key={book.id}
                style={{
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  padding: '20px',
                  background: book.isVisible ? 'white' : '#f8f9fa',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                  opacity: book.isVisible ? 1 : 0.7
                }}
              >
                <h3 style={{ marginTop: 0, color: '#2c3e50' }}>{book.title}</h3>
                <p style={{ color: '#7f8c8d', fontSize: '14px' }}>
                  by {book.author}
                </p>

                {activeTab === 'borrowed' && (
                  <p style={{ fontSize: '12px', color: '#95a5a6', marginBottom: '10px' }}>
                    Owner: {book.owner?.name}
                  </p>
                )}

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

                {book.status === 'BORROWED' && book.holder && activeTab === 'owned' && (
                  <p style={{ 
                    marginTop: '10px', 
                    fontSize: '12px', 
                    color: '#95a5a6' 
                  }}>
                    Currently held by: {book.holder.name}
                  </p>
                )}

                {/* Action Buttons - Only for owned books */}
                {activeTab === 'owned' && (
                  <div style={{ 
                    marginTop: '15px', 
                    display: 'flex', 
                    gap: '8px',
                    flexWrap: 'wrap'
                  }}>
                    <button
                      onClick={() => handleBookAction(book.id, book.isVisible ? 'hide' : 'show')}
                      style={{
                        flex: 1,
                        padding: '8px',
                        background: '#95a5a6',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '12px'
                      }}
                    >
                      {book.isVisible ? '🙈 Hide' : '👁️ Show'}
                    </button>
                    <button
                      onClick={() => handleBookAction(book.id, 'delete')}
                      disabled={book.status === 'BORROWED'}
                      style={{
                        flex: 1,
                        padding: '8px',
                        background: book.status === 'BORROWED' ? '#bdc3c7' : '#e74c3c',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: book.status === 'BORROWED' ? 'not-allowed' : 'pointer',
                        fontSize: '12px'
                      }}
                      title={book.status === 'BORROWED' ? 'Cannot delete borrowed books' : ''}
                    >
                      🗑️ Delete
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}