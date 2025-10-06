// src/pages/agent/dashboard.tsx - WITH VERIFICATION
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import api from '../../utils/api';
import Layout from '../../components/Layout';
import { useAuth } from '../../context/AuthContext';
import { Delivery } from '../../types';

export default function AgentDashboard() {
  const [availableDeliveries, setAvailableDeliveries] = useState<Delivery[]>([]);
  const [myDeliveries, setMyDeliveries] = useState<Delivery[]>([]);
  const [activeTab, setActiveTab] = useState<'available' | 'my'>('available');
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<number | null>(null);
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    if (user?.role !== 'DELIVERY_AGENT') {
      router.push('/');
      alert('Access denied. Delivery agent role required.');
      return;
    }
    loadDeliveries();
  }, [isAuthenticated, user]);

  const loadDeliveries = async () => {
    setLoading(true);
    try {
      const [availableRes, myRes] = await Promise.all([
        api.get('/delivery/available'),
        api.get('/delivery/my-deliveries')
      ]);
      setAvailableDeliveries(availableRes.data);
      setMyDeliveries(myRes.data);
    } catch (err) {
      console.error('Error loading deliveries:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAssign = async (deliveryId: number) => {
    if (processing) return;
    
    setProcessing(deliveryId);
    try {
      await api.patch(`/delivery/${deliveryId}/assign`);
      alert('Delivery assigned successfully!');
      await loadDeliveries();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to assign delivery');
    } finally {
      setProcessing(null);
    }
  };

  const handleVerify = async (deliveryId: number) => {
    if (processing) return;

    const code = prompt('Enter the 6-digit verification code from the borrower:');
    
    if (!code) return;

    setProcessing(deliveryId);
    try {
      await api.post(`/delivery/${deliveryId}/verify`, {
        verificationCode: code
      });
      alert('Code verified! You can now pick up the book.');
      await loadDeliveries();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Invalid verification code');
    } finally {
      setProcessing(null);
    }
  };

  const handleUpdateStatus = async (deliveryId: number, newStatus: string) => {
    if (processing) return;

    const notes = prompt('Add tracking notes (optional):');
    
    setProcessing(deliveryId);
    try {
      await api.patch(`/delivery/${deliveryId}/status`, {
        status: newStatus,
        trackingNotes: notes || undefined
      });
      alert('Status updated successfully!');
      await loadDeliveries();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to update status');
    } finally {
      setProcessing(null);
    }
  };

  const getStatusColor = (status: string) => {
    const colors: { [key: string]: string } = {
      'PENDING': '#f39c12',
      'ASSIGNED': '#3498db',
      'PICKED_UP': '#9b59b6',
      'IN_TRANSIT': '#1abc9c',
      'DELIVERED': '#27ae60',
      'COMPLETED': '#95a5a6'
    };
    return colors[status] || '#95a5a6';
  };

  const getNextActions = (delivery: Delivery) => {
    const actions = [];
    
    // If assigned but not verified, show verify button
    if (delivery.status === 'ASSIGNED' && !delivery.codeVerifiedAt) {
      return [{ label: '🔐 Verify Code', value: 'VERIFY', type: 'verify' }];
    }
    
    // After verification, allow status updates
    if (delivery.codeVerifiedAt) {
      switch (delivery.status) {
        case 'ASSIGNED':
          return [{ label: '📦 Mark as Picked Up', value: 'PICKED_UP', type: 'status' }];
        case 'PICKED_UP':
          return [{ label: '🚚 Mark In Transit', value: 'IN_TRANSIT', type: 'status' }];
        case 'IN_TRANSIT':
          return [{ label: '✅ Mark as Delivered', value: 'DELIVERED', type: 'status' }];
        case 'DELIVERED':
          return [{ label: '✓ Complete Delivery', value: 'COMPLETED', type: 'status' }];
      }
    }
    
    return [];
  };

  if (!isAuthenticated || user?.role !== 'DELIVERY_AGENT') return null;

  if (loading) {
    return <Layout><p>Loading deliveries...</p></Layout>;
  }

  return (
    <Layout>
      <div>
        <h1>🚚 Delivery Agent Dashboard</h1>

        {/* Tabs */}
        <div style={{ 
          display: 'flex', 
          gap: '10px', 
          marginBottom: '30px', 
          borderBottom: '2px solid #ddd' 
        }}>
          <button
            onClick={() => setActiveTab('available')}
            style={{
              padding: '10px 20px',
              background: activeTab === 'available' ? '#3498db' : 'transparent',
              color: activeTab === 'available' ? 'white' : '#333',
              border: 'none',
              borderBottom: activeTab === 'available' ? '3px solid #2980b9' : 'none',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: activeTab === 'available' ? 'bold' : 'normal'
            }}
          >
            Available Deliveries ({availableDeliveries.length})
          </button>
          <button
            onClick={() => setActiveTab('my')}
            style={{
              padding: '10px 20px',
              background: activeTab === 'my' ? '#3498db' : 'transparent',
              color: activeTab === 'my' ? 'white' : '#333',
              border: 'none',
              borderBottom: activeTab === 'my' ? '3px solid #2980b9' : 'none',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: activeTab === 'my' ? 'bold' : 'normal'
            }}
          >
            My Deliveries ({myDeliveries.length})
          </button>
        </div>

        {/* Available Deliveries Tab */}
        {activeTab === 'available' && (
          <div>
            {availableDeliveries.length === 0 ? (
              <div style={{ padding: '40px', textAlign: 'center', background: '#f8f9fa', borderRadius: '8px' }}>
                <p>No available deliveries at the moment.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {availableDeliveries.map((delivery) => (
                  <div key={delivery.id} style={{
                    border: '1px solid #ddd',
                    borderRadius: '8px',
                    padding: '20px',
                    background: 'white'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
                      <div>
                        <h3 style={{ margin: '0 0 10px 0' }}>
                          Delivery Request #{delivery.id}
                        </h3>
                        <p style={{ margin: '5px 0', color: '#7f8c8d', fontSize: '14px' }}>
                          Delivery Fee: ₹{delivery.paymentAmount || 50}
                        </p>
                      </div>
                      <div style={{
                        padding: '5px 15px',
                        borderRadius: '20px',
                        background: getStatusColor(delivery.status),
                        color: 'white',
                        height: 'fit-content',
                        fontWeight: 'bold',
                        fontSize: '12px'
                      }}>
                        {delivery.status}
                      </div>
                    </div>

                    <div style={{ marginBottom: '10px' }}>
                      <strong>📍 Pickup:</strong> {delivery.pickupAddress}
                    </div>
                    <div style={{ marginBottom: '15px' }}>
                      <strong>📍 Delivery:</strong> {delivery.deliveryAddress}
                    </div>

                    <button
                      onClick={() => handleAssign(delivery.id)}
                      disabled={processing === delivery.id}
                      style={{
                        padding: '10px 20px',
                        background: '#27ae60',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: processing === delivery.id ? 'not-allowed' : 'pointer',
                        opacity: processing === delivery.id ? 0.7 : 1,
                        fontWeight: 'bold'
                      }}
                    >
                      {processing === delivery.id ? 'Assigning...' : 'Accept Delivery'}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* My Deliveries Tab */}
        {activeTab === 'my' && (
          <div>
            {myDeliveries.length === 0 ? (
              <div style={{ padding: '40px', textAlign: 'center', background: '#f8f9fa', borderRadius: '8px' }}>
                <p>You don't have any assigned deliveries yet.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {myDeliveries.map((delivery) => (
                  <div key={delivery.id} style={{
                    border: '1px solid #ddd',
                    borderRadius: '8px',
                    padding: '20px',
                    background: 'white'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
                      <div>
                        <h3 style={{ margin: '0 0 10px 0' }}>
                          Delivery #{delivery.id}
                        </h3>
                        <p style={{ margin: '5px 0', color: '#7f8c8d', fontSize: '14px' }}>
                          Fee: ₹{delivery.paymentAmount || 50}
                        </p>
                      </div>
                      <div>
                        <div style={{
                          padding: '5px 15px',
                          borderRadius: '20px',
                          background: getStatusColor(delivery.status),
                          color: 'white',
                          fontWeight: 'bold',
                          fontSize: '12px',
                          marginBottom: '5px'
                        }}>
                          {delivery.status}
                        </div>
                        {delivery.codeVerifiedAt && (
                          <div style={{
                            padding: '3px 8px',
                            background: '#27ae60',
                            color: 'white',
                            borderRadius: '3px',
                            fontSize: '10px',
                            textAlign: 'center'
                          }}>
                            ✓ Verified
                          </div>
                        )}
                      </div>
                    </div>

                    <div style={{ marginBottom: '10px' }}>
                      <strong>📍 Pickup:</strong> {delivery.pickupAddress}
                    </div>
                    <div style={{ marginBottom: '10px' }}>
                      <strong>📍 Delivery:</strong> {delivery.deliveryAddress}
                    </div>

                    {delivery.trackingNotes && (
                      <div style={{ 
                        padding: '10px', 
                        background: '#e8f5e9', 
                        borderRadius: '4px',
                        marginBottom: '15px',
                        fontSize: '14px'
                      }}>
                        <strong>Notes:</strong> {delivery.trackingNotes}
                      </div>
                    )}

                    {!delivery.codeVerifiedAt && delivery.status === 'ASSIGNED' && (
                      <div style={{ 
                        padding: '12px', 
                        background: '#fff3cd', 
                        borderRadius: '4px',
                        marginBottom: '15px',
                        color: '#856404'
                      }}>
                        ⚠️ <strong>Action Required:</strong> Ask the borrower for the 6-digit verification code before pickup.
                      </div>
                    )}

                    {getNextActions(delivery).length > 0 && (
                      <div style={{ display: 'flex', gap: '10px', paddingTop: '15px', borderTop: '1px solid #ddd' }}>
                        {getNextActions(delivery).map((action) => (
                          <button
                            key={action.value}
                            onClick={() => 
                              action.type === 'verify' 
                                ? handleVerify(delivery.id)
                                : handleUpdateStatus(delivery.id, action.value)
                            }
                            disabled={processing === delivery.id}
                            style={{
                              padding: '10px 20px',
                              background: action.type === 'verify' ? '#f39c12' : '#3498db',
                              color: 'white',
                              border: 'none',
                              borderRadius: '4px',
                              cursor: processing === delivery.id ? 'not-allowed' : 'pointer',
                              opacity: processing === delivery.id ? 0.7 : 1,
                              fontWeight: 'bold'
                            }}
                          >
                            {action.label}
                          </button>
                        ))}
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