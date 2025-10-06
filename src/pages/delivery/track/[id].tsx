// src/pages/delivery/track/[id].tsx
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import api from '../../../utils/api';
import Layout from '../../../components/Layout';
import { useAuth } from '../../../context/AuthContext';
import { Delivery } from '../../../types';

export default function TrackDelivery() {
  const [delivery, setDelivery] = useState<Delivery | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const { id } = router.query;

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    if (id) {
      loadDelivery();
      // Auto-refresh every 30 seconds
      const interval = setInterval(loadDelivery, 30000);
      return () => clearInterval(interval);
    }
  }, [isAuthenticated, id]);

  const loadDelivery = async () => {
    try {
      const res = await api.get(`/delivery/track/${id}`);
      setDelivery(res.data);
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load delivery information');
    } finally {
      setLoading(false);
    }
  };

  const getStatusInfo = (status: string) => {
    const statusMap: { [key: string]: { icon: string; color: string; label: string } } = {
      PENDING: { icon: '⏳', color: '#f39c12', label: 'Waiting for Agent' },
      ASSIGNED: { icon: '👤', color: '#3498db', label: 'Agent Assigned' },
      PICKUP_SCHEDULED: { icon: '📅', color: '#9b59b6', label: 'Pickup Scheduled' },
      PICKED_UP: { icon: '📦', color: '#1abc9c', label: 'Picked Up' },
      IN_TRANSIT: { icon: '🚚', color: '#e67e22', label: 'In Transit' },
      DELIVERED: { icon: '✅', color: '#27ae60', label: 'Delivered' },
      RETURN_SCHEDULED: { icon: '🔄', color: '#9b59b6', label: 'Return Scheduled' },
      RETURN_PICKED_UP: { icon: '📦', color: '#1abc9c', label: 'Return Picked Up' },
      RETURN_DELIVERED: { icon: '✅', color: '#27ae60', label: 'Returned' },
      COMPLETED: { icon: '✓', color: '#95a5a6', label: 'Completed' },
      CANCELLED: { icon: '✗', color: '#e74c3c', label: 'Cancelled' }
    };
    return statusMap[status] || { icon: '❓', color: '#95a5a6', label: status };
  };

  const getProgressPercentage = (status: string) => {
    const progressMap: { [key: string]: number } = {
      PENDING: 10,
      ASSIGNED: 20,
      PICKUP_SCHEDULED: 30,
      PICKED_UP: 50,
      IN_TRANSIT: 70,
      DELIVERED: 90,
      COMPLETED: 100,
      CANCELLED: 0
    };
    return progressMap[status] || 0;
  };

  if (!isAuthenticated) return null;

  if (loading) {
    return <Layout><p>Loading delivery information...</p></Layout>;
  }

  if (error || !delivery) {
    return (
      <Layout>
        <div style={{ maxWidth: '800px', margin: '50px auto', textAlign: 'center' }}>
          <div style={{
            padding: '40px',
            background: '#ffebee',
            borderRadius: '8px',
            color: '#c62828'
          }}>
            <h2>❌ {error || 'Delivery not found'}</h2>
            <button
              onClick={() => router.push('/requests')}
              style={{
                marginTop: '20px',
                padding: '10px 20px',
                background: '#3498db',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Back to Requests
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  const statusInfo = getStatusInfo(delivery.status);
  const progress = getProgressPercentage(delivery.status);

  return (
    <Layout>
      <div style={{ maxWidth: '900px', margin: '50px auto' }}>
        <h1>📦 Track Your Delivery</h1>

        {/* Book Info */}
        <div style={{
          padding: '20px',
          background: 'white',
          border: '1px solid #ddd',
          borderRadius: '8px',
          marginBottom: '30px'
        }}>
          <h2 style={{ marginTop: 0 }}>
            {delivery.borrowRequest?.book?.title ?? 'Unknown Title'}
          </h2>
          <p style={{ color: '#7f8c8d', margin: '5px 0' }}>
            by {delivery.borrowRequest?.book?.author ?? 'Unknown Author'}
          </p>
        </div>

        {/* Current Status */}
        <div style={{
          padding: '30px',
          background: statusInfo.color,
          color: 'white',
          borderRadius: '8px',
          textAlign: 'center',
          marginBottom: '30px'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '10px' }}>
            {statusInfo.icon}
          </div>
          <h2 style={{ margin: '0 0 10px 0' }}>{statusInfo.label}</h2>
          <p style={{ margin: 0, opacity: 0.9 }}>
            Last updated: {new Date(delivery.updatedAt).toLocaleString()}
          </p>
        </div>

        {/* Progress Bar */}
        <div style={{ marginBottom: '30px' }}>
          <div style={{
            width: '100%',
            height: '30px',
            background: '#ecf0f1',
            borderRadius: '15px',
            overflow: 'hidden'
          }}>
            <div style={{
              width: `${progress}%`,
              height: '100%',
              background: 'linear-gradient(90deg, #3498db, #27ae60)',
              transition: 'width 0.5s ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end',
              paddingRight: '10px',
              color: 'white',
              fontWeight: 'bold',
              fontSize: '14px'
            }}>
              {progress > 10 && `${progress}%`}
            </div>
          </div>
        </div>

        {/* Details Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '20px',
          marginBottom: '30px'
        }}>
          {/* Addresses */}
          <div style={{
            padding: '20px',
            background: 'white',
            border: '1px solid #ddd',
            borderRadius: '8px'
          }}>
            <h3 style={{ marginTop: 0, color: '#2c3e50' }}>📍 Addresses</h3>
            <div style={{ marginBottom: '15px' }}>
              <strong style={{ color: '#7f8c8d' }}>Pickup:</strong>
              <p style={{ margin: '5px 0' }}>{delivery.pickupAddress}</p>
            </div>
            <div>
              <strong style={{ color: '#7f8c8d' }}>Delivery:</strong>
              <p style={{ margin: '5px 0' }}>{delivery.deliveryAddress}</p>
            </div>
          </div>

          {/* Parties Involved */}
          <div style={{
            padding: '20px',
            background: 'white',
            border: '1px solid #ddd',
            borderRadius: '8px'
          }}>
            <h3 style={{ marginTop: 0, color: '#2c3e50' }}>👥 People</h3>
            <div style={{ marginBottom: '10px' }}>
              <strong style={{ color: '#7f8c8d' }}>Owner:</strong>
              <p style={{ margin: '5px 0' }}>{delivery.borrowRequest?.book.owner?.name ?? 'Unknown Owner'}</p>
            </div>
            <div style={{ marginBottom: '10px' }}>
              <strong style={{ color: '#7f8c8d' }}>Borrower:</strong>
              <p style={{ margin: '5px 0' }}>{delivery.borrowRequest?.borrower?.name}</p>
            </div>
            {delivery.agent && (
              <div>
                <strong style={{ color: '#7f8c8d' }}>Agent:</strong>
                <p style={{ margin: '5px 0' }}>{delivery.agent.name}</p>
              </div>
            )}
          </div>
        </div>

        {/* Tracking Notes */}
        {delivery.trackingNotes && (
          <div style={{
            padding: '20px',
            background: '#e8f5e9',
            borderLeft: '4px solid #27ae60',
            borderRadius: '4px',
            marginBottom: '30px'
          }}>
            <h3 style={{ marginTop: 0, color: '#2c3e50' }}>📝 Tracking Notes</h3>
            <p style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{delivery.trackingNotes}</p>
          </div>
        )}

        {/* Timeline */}
        <div style={{
          padding: '20px',
          background: 'white',
          border: '1px solid #ddd',
          borderRadius: '8px'
        }}>
          <h3 style={{ marginTop: 0, color: '#2c3e50' }}>⏱️ Timeline</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <TimelineItem
              date={delivery.createdAt}
              title="Delivery Requested"
              icon="📋"
              completed={true}
            />
            {delivery.pickupScheduled && (
              <TimelineItem
                date={delivery.pickupScheduled}
                title="Pickup Scheduled"
                icon="📅"
                completed={true}
              />
            )}
            {delivery.pickupCompleted && (
              <TimelineItem
                date={delivery.pickupCompleted}
                title="Pickup Completed"
                icon="📦"
                completed={true}
              />
            )}
            {delivery.deliveryCompleted && (
              <TimelineItem
                date={delivery.deliveryCompleted}
                title="Delivery Completed"
                icon="✅"
                completed={true}
              />
            )}
          </div>
        </div>

        {/* Refresh Button */}
        <div style={{ marginTop: '30px', textAlign: 'center' }}>
          <button
            onClick={loadDelivery}
            style={{
              padding: '12px 30px',
              background: '#3498db',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: 'bold'
            }}
          >
            🔄 Refresh Status
          </button>
          <p style={{ marginTop: '10px', fontSize: '12px', color: '#95a5a6' }}>
            Auto-refreshes every 30 seconds
          </p>
        </div>
      </div>
    </Layout>
  );
}

function TimelineItem({ date, title, icon, completed }: {
  date: Date;
  title: string;
  icon: string;
  completed: boolean;
}) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'flex-start',
      gap: '15px',
      opacity: completed ? 1 : 0.5
    }}>
      <div style={{
        width: '40px',
        height: '40px',
        borderRadius: '50%',
        background: completed ? '#27ae60' : '#ecf0f1',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '20px',
        flexShrink: 0
      }}>
        {icon}
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 'bold', color: '#2c3e50' }}>{title}</div>
        <div style={{ fontSize: '12px', color: '#7f8c8d', marginTop: '3px' }}>
          {new Date(date).toLocaleString()}
        </div>
      </div>
    </div>
  );
}