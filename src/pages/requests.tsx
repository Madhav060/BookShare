// src/pages/requests.tsx - FIXED SESSION PERSISTENCE
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import api from '../utils/api';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';
import { RequestsResponse, BorrowRequest } from '../types';

export default function Requests() {
  const [requests, setRequests] = useState<RequestsResponse>({ incoming: [], outgoing: [] });
  const [activeTab, setActiveTab] = useState<'incoming' | 'outgoing'>('incoming');
  const [dataLoading, setDataLoading] = useState(true);
  const [processing, setProcessing] = useState<number | null>(null);
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    
    loadRequests();
  }, [isAuthenticated, loading, router]);

  const loadRequests = async () => {
    try {
      const res = await api.get('/requests');
      setRequests(res.data);
    } catch (err) {
      console.error('Error loading requests:', err);
    } finally {
      setDataLoading(false);
    }
  };

  const handleRespond = async (requestId: number, action: 'ACCEPT' | 'REJECT') => {
    setProcessing(requestId);
    try {
      await api.patch(`/requests/${requestId}/respond`, { action });
      alert(`Request ${action.toLowerCase()}ed successfully!`);
      await loadRequests();
    } catch (err: any) {
      alert(err.response?.data?.error || `Failed to ${action.toLowerCase()} request`);
    } finally {
      setProcessing(null);
    }
  };

  const handleComplete = async (requestId: number) => {
    setProcessing(requestId);
    try {
      await api.patch(`/requests/${requestId}/complete`);
      alert('Book marked as returned successfully!');
      await loadRequests();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to complete request');
    } finally {
      setProcessing(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return '#f39c12';
      case 'ACCEPTED': return '#27ae60';
      case 'REJECTED': return '#e74c3c';
      case 'COMPLETED': return '#95a5a6';
      default: return '#95a5a6';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'PENDING': return '⏳ Pending';
      case 'ACCEPTED': return '✓ Accepted';
      case 'REJECTED': return '✗ Rejected';
      case 'COMPLETED': return '✓ Completed';
      default: return status;
    }
  };

  if (loading) {
    return <Layout><p>Loading...</p></Layout>;
  }

  if (!isAuthenticated) {
    return null;
  }

  if (dataLoading) {
    return <Layout><p>Loading requests...</p></Layout>;
  }

  return (
    <Layout>
      <div>
        <h1>📋 Borrow Requests</h1>
        
        {/* Tabs */}
        <div style={{ display: 'flex', gap: '10px', marginBottom: '30px', borderBottom: '2px solid #ddd' }}>
          <button
            onClick={() => setActiveTab('incoming')}
            style={{
              padding: '10px 20px',
              background: activeTab === 'incoming' ? '#3498db' : 'transparent',
              color: activeTab === 'incoming' ? 'white' : '#333',
              border: 'none',
              borderBottom: activeTab === 'incoming' ? '3px solid #2980b9' : 'none',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: activeTab === 'incoming' ? 'bold' : 'normal'
            }}
          >
            Incoming Requests ({requests.incoming.length})
          </button>
          <button
            onClick={() => setActiveTab('outgoing')}
            style={{
              padding: '10px 20px',
              background: activeTab === 'outgoing' ? '#3498db' : 'transparent',
              color: activeTab === 'outgoing' ? 'white' : '#333',
              border: 'none',
              borderBottom: activeTab === 'outgoing' ? '3px solid #2980b9' : 'none',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: activeTab === 'outgoing' ? 'bold' : 'normal'
            }}
          >
            My Requests ({requests.outgoing.length})
          </button>
        </div>

        {/* Incoming Requests Tab */}
        {activeTab === 'incoming' && (
          <div>
            {requests.incoming.length === 0 ? (
              <div style={{ padding: '40px', textAlign: 'center', background: '#f8f9fa', borderRadius: '8px' }}>
                <p>No incoming requests yet.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {requests.incoming.map((request) => (
                  <div
                    key={request.id}
                    style={{
                      border: '1px solid #ddd',
                      borderRadius: '8px',
                      padding: '20px',
                      background: 'white',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '15px' }}>
                      <div style={{ flex: 1 }}>
                        <h3 style={{ marginTop: 0, color: '#2c3e50' }}>{request.book?.title}</h3>
                        <p style={{ color: '#7f8c8d', margin: '5px 0' }}>
                          by {request.book?.author}
                        </p>
                        <p style={{ color: '#95a5a6', fontSize: '14px', margin: '5px 0' }}>
                          Requested by: <strong>{request.borrower?.name}</strong>
                        </p>
                        <p style={{ color: '#95a5a6', fontSize: '12px', margin: '5px 0' }}>
                          {new Date(request.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', minWidth: '150px' }}>
                        <div
                          style={{
                            padding: '8px',
                            background: getStatusColor(request.status),
                            color: 'white',
                            borderRadius: '4px',
                            textAlign: 'center',
                            fontSize: '14px',
                            fontWeight: 'bold'
                          }}
                        >
                          {getStatusLabel(request.status)}
                        </div>
                        
                        {request.status === 'PENDING' && (
                          <div style={{ display: 'flex', gap: '5px' }}>
                            <button
                              onClick={() => handleRespond(request.id, 'ACCEPT')}
                              disabled={processing === request.id}
                              style={{
                                flex: 1,
                                padding: '8px',
                                background: '#27ae60',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: processing === request.id ? 'not-allowed' : 'pointer',
                                fontSize: '14px'
                              }}
                            >
                              Accept
                            </button>
                            <button
                              onClick={() => handleRespond(request.id, 'REJECT')}
                              disabled={processing === request.id}
                              style={{
                                flex: 1,
                                padding: '8px',
                                background: '#e74c3c',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: processing === request.id ? 'not-allowed' : 'pointer',
                                fontSize: '14px'
                              }}
                            >
                              Reject
                            </button>
                          </div>
                        )}
                        
                        {request.status === 'ACCEPTED' && (
                          <>
                            <button
                              onClick={() => handleComplete(request.id)}
                              disabled={processing === request.id}
                              style={{
                                padding: '8px',
                                background: '#3498db',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: processing === request.id ? 'not-allowed' : 'pointer',
                                fontSize: '14px'
                              }}
                            >
                              Mark as Returned
                            </button>
                            {request.delivery && (
                              <Link 
                                href={`/delivery/track/${request.delivery.id}`}
                                style={{
                                  padding: '8px',
                                  background: '#9b59b6',
                                  color: 'white',
                                  border: 'none',
                                  borderRadius: '4px',
                                  textDecoration: 'none',
                                  display: 'block',
                                  textAlign: 'center',
                                  fontSize: '14px'
                                }}>
                                🚚 Track Delivery
                              </Link>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Outgoing Requests Tab */}
        {activeTab === 'outgoing' && (
          <div>
            {requests.outgoing.length === 0 ? (
              <div style={{ padding: '40px', textAlign: 'center', background: '#f8f9fa', borderRadius: '8px' }}>
                <p>You haven't made any borrow requests yet.</p>
                <Link 
                  href="/"
                  style={{
                    display: 'inline-block',
                    marginTop: '15px',
                    padding: '10px 20px',
                    background: '#3498db',
                    color: 'white',
                    textDecoration: 'none',
                    borderRadius: '4px'
                  }}>
                  Browse Books
                </Link>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {requests.outgoing.map((request) => (
                  <div
                    key={request.id}
                    style={{
                      border: '1px solid #ddd',
                      borderRadius: '8px',
                      padding: '20px',
                      background: 'white',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                      <div style={{ flex: 1 }}>
                        <h3 style={{ marginTop: 0, color: '#2c3e50' }}>{request.book?.title}</h3>
                        <p style={{ color: '#7f8c8d', margin: '5px 0' }}>
                          by {request.book?.author}
                        </p>
                        <p style={{ color: '#95a5a6', fontSize: '14px', margin: '5px 0' }}>
                          Owner: <strong>{request.book?.owner?.name}</strong>
                        </p>
                        <p style={{ color: '#95a5a6', fontSize: '12px', margin: '5px 0' }}>
                          Requested on: {new Date(request.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        <div
                          style={{
                            padding: '8px 16px',
                            background: getStatusColor(request.status),
                            color: 'white',
                            borderRadius: '4px',
                            fontSize: '14px',
                            fontWeight: 'bold',
                            whiteSpace: 'nowrap'
                          }}
                        >
                          {getStatusLabel(request.status)}
                        </div>
                        {request.status === 'ACCEPTED' && request.delivery && (
                          <Link 
                            href={`/delivery/track/${request.delivery.id}`}
                            style={{
                              padding: '8px 16px',
                              background: '#9b59b6',
                              color: 'white',
                              border: 'none',
                              borderRadius: '4px',
                              textDecoration: 'none',
                              display: 'block',
                              textAlign: 'center',
                              fontSize: '14px',
                              whiteSpace: 'nowrap'
                            }}>
                            🚚 Track Delivery
                          </Link>
                        )}
                      </div>
                    </div>
                    
                    {request.status === 'ACCEPTED' && (
                      <div style={{ 
                        marginTop: '15px', 
                        padding: '12px', 
                        background: '#d4edda', 
                        borderRadius: '4px',
                        color: '#155724'
                      }}>
                        <div style={{ marginBottom: '10px' }}>
                          ✓ Your request was accepted! 
                        </div>
                        {!request.delivery ? (
                          <Link 
                            href="/delivery/request"
                            style={{
                              display: 'inline-block',
                              padding: '8px 16px',
                              background: '#27ae60',
                              color: 'white',
                              textDecoration: 'none',
                              borderRadius: '4px',
                              fontWeight: 'bold'
                            }}>
                            🚚 Request Delivery Service
                          </Link>
                        ) : (
                          <div style={{ fontSize: '14px', marginTop: '5px' }}>
                            Delivery requested. <Link href={`/delivery/track/${request.delivery.id}`} style={{ color: '#155724', fontWeight: 'bold' }}>Track delivery →</Link>
                          </div>
                        )}
                      </div>
                    )}
                    
                    {request.status === 'REJECTED' && (
                      <div style={{ 
                        marginTop: '15px', 
                        padding: '10px', 
                        background: '#f8d7da', 
                        borderRadius: '4px',
                        color: '#721c24'
                      }}>
                        ✗ Your request was rejected by the owner.
                      </div>
                    )}
                    
                    {request.status === 'COMPLETED' && (
                      <div style={{ 
                        marginTop: '15px', 
                        padding: '10px', 
                        background: '#d1ecf1', 
                        borderRadius: '4px',
                        color: '#0c5460'
                      }}>
                        ✓ This borrow transaction is complete. Thank you!
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
}