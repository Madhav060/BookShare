// src/pages/dashboard.tsx - FIXED SESSION PERSISTENCE
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import api from '../utils/api';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';

interface Analytics {
  stats: {
    ownedBooks: number;
    borrowedBooks: number;
    incomingRequests: number;
    outgoingRequests: number;
    lentOut: number;
    completedTransactions: number;
  };
  recentBooks: Array<{
    id: number;
    title: string;
    author: string;
    status: string;
    createdAt: string;
  }>;
  recentRequests: Array<{
    id: number;
    status: string;
    createdAt: string;
    book: {
      id: number;
      title: string;
      author: string;
    };
    borrower: {
      id: number;
      name: string;
    };
  }>;
}

export default function Dashboard() {
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [dataLoading, setDataLoading] = useState(true);
  const { isAuthenticated, user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    
    loadAnalytics();
  }, [isAuthenticated, loading, router]);

  const loadAnalytics = async () => {
    try {
      const res = await api.get('/analytics/user');
      setAnalytics(res.data);
    } catch (err) {
      console.error('Error loading analytics:', err);
      setAnalytics(null);
    } finally {
      setDataLoading(false);
    }
  };

  if (loading) {
    return <Layout><p>Loading...</p></Layout>;
  }

  if (!isAuthenticated) {
    return null;
  }

  if (dataLoading) {
    return <Layout><p>Loading dashboard...</p></Layout>;
  }

  return (
    <Layout>
      <div>
        <h1>📊 Dashboard</h1>
        <p style={{ color: '#666', marginBottom: '30px' }}>
          Welcome back, {user?.name}!
        </p>

        {analytics ? (
          <>
            {/* Stats Grid */}
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
              gap: '20px',
              marginBottom: '40px'
            }}>
              <StatCard 
                title="My Books" 
                value={analytics.stats.ownedBooks} 
                icon="📚"
                color="#3498db"
              />
              <StatCard 
                title="Borrowed" 
                value={analytics.stats.borrowedBooks} 
                icon="📖"
                color="#2ecc71"
              />
              <StatCard 
                title="Lent Out" 
                value={analytics.stats.lentOut} 
                icon="📤"
                color="#f39c12"
              />
              <StatCard 
                title="Incoming Requests" 
                value={analytics.stats.incomingRequests} 
                icon="📥"
                color="#9b59b6"
              />
              <StatCard 
                title="My Requests" 
                value={analytics.stats.outgoingRequests} 
                icon="📨"
                color="#e74c3c"
              />
              <StatCard 
                title="Completed" 
                value={analytics.stats.completedTransactions} 
                icon="✅"
                color="#95a5a6"
              />
            </div>

            {/* Recent Activity */}
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', 
              gap: '20px' 
            }}>
              {/* Recent Books */}
              <div style={{
                border: '1px solid #ddd',
                borderRadius: '8px',
                padding: '20px',
                background: 'white'
              }}>
                <h2 style={{ marginTop: 0, fontSize: '18px' }}>Recently Added Books</h2>
                {analytics.recentBooks.length === 0 ? (
                  <p style={{ color: '#999' }}>No books yet</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {analytics.recentBooks.map(book => (
                      <div key={book.id} style={{
                        padding: '10px',
                        background: '#f8f9fa',
                        borderRadius: '4px'
                      }}>
                        <div style={{ fontWeight: 'bold' }}>{book.title}</div>
                        <div style={{ fontSize: '12px', color: '#666' }}>
                          by {book.author} • {book.status}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Recent Requests */}
              <div style={{
                border: '1px solid #ddd',
                borderRadius: '8px',
                padding: '20px',
                background: 'white'
              }}>
                <h2 style={{ marginTop: 0, fontSize: '18px' }}>Recent Requests</h2>
                {analytics.recentRequests.length === 0 ? (
                  <p style={{ color: '#999' }}>No requests yet</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {analytics.recentRequests.map(request => (
                      <div key={request.id} style={{
                        padding: '10px',
                        background: '#f8f9fa',
                        borderRadius: '4px'
                      }}>
                        <div style={{ fontWeight: 'bold' }}>{request.book.title}</div>
                        <div style={{ fontSize: '12px', color: '#666' }}>
                          {request.borrower.name} • {request.status}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </>
        ) : (
          <div style={{
            padding: '40px',
            textAlign: 'center',
            background: '#f8f9fa',
            borderRadius: '8px'
          }}>
            <p>Analytics unavailable. Browse your books and requests using the navigation menu.</p>
          </div>
        )}
      </div>
    </Layout>
  );
}

function StatCard({ title, value, icon, color }: { 
  title: string; 
  value: number; 
  icon: string;
  color: string;
}) {
  return (
    <div style={{
      border: '1px solid #ddd',
      borderRadius: '8px',
      padding: '20px',
      background: 'white',
      textAlign: 'center',
      borderTop: `4px solid ${color}`
    }}>
      <div style={{ fontSize: '32px', marginBottom: '10px' }}>{icon}</div>
      <div style={{ fontSize: '28px', fontWeight: 'bold', color }}>{value}</div>
      <div style={{ fontSize: '14px', color: '#666' }}>{title}</div>
    </div>
  );
}