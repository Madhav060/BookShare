// src/pages/add-book.tsx
import { useState, useEffect } from 'react'; // Import useEffect
import { useRouter } from 'next/router';
import api from '../utils/api';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';

export default function AddBook() {
  const [form, setForm] = useState({ title: '', author: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { isAuthenticated } = useAuth();

  // Redirect if not authenticated (the correct way)
  useEffect(() => {
    // We also check if the router is ready before trying to push
    if (!isAuthenticated && router.isReady) {
      router.push('/login');
    }
  }, [isAuthenticated, router]); // Dependency array ensures this runs when state changes

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await api.post('/books', form);
      alert('Book added successfully!');
      setForm({ title: '', author: '' });
      router.push('/my-shelf');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to add book');
    } finally {
      setLoading(false);
    }
  };

  // Render a loading state or null while checking auth to prevent flash of content
  if (!isAuthenticated) {
    return <div>Loading...</div>; // Or return null
  }
  
  return (
    <Layout>
      <div style={{ maxWidth: '600px', margin: '50px auto' }}>
        <h1>➕ Add a Book</h1>
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
        <form onSubmit={handleSubmit}>
          {/* ... your form inputs and button ... */}
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px' }}>Title</label>
            <input
              placeholder="Book Title"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              required
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #ddd',
                borderRadius: '4px'
              }}
            />
          </div>
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px' }}>Author</label>
            <input
              placeholder="Author Name"
              value={form.author}
              onChange={(e) => setForm({ ...form, author: e.target.value })}
              required
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #ddd',
                borderRadius: '4px'
              }}
            />
          </div>
          <button 
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '12px',
              background: '#3498db',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1
            }}
          >
            {loading ? 'Adding Book...' : 'Add Book'}
          </button>
        </form>
      </div>
    </Layout>
  );
}