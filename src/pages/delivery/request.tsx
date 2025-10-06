// src/pages/delivery/request.tsx
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import api from '../../utils/api';
import Layout from '../../components/Layout';
import { useAuth } from '../../context/AuthContext';

export default function RequestDelivery() {
  const [borrowRequests, setBorrowRequests] = useState<any[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<number | null>(null);
  const [pickupAddress, setPickupAddress] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [showCode, setShowCode] = useState(false);
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    loadAcceptedRequests();
  }, [isAuthenticated]);

  const loadAcceptedRequests = async () => {
    try {
      const res = await api.get('/requests');
      
      // Only show outgoing (borrower's) accepted requests without delivery
      const acceptedOutgoing = res.data.outgoing.filter(
        (r: any) => r.status === 'ACCEPTED' && !r.delivery
      );

      setBorrowRequests(acceptedOutgoing);
    } catch (err) {
      console.error('Error loading requests:', err);
      setError('Failed to load borrow requests');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedRequest) {
      alert('Please select a borrow request');
      return;
    }

    if (!pickupAddress.trim() || !deliveryAddress.trim()) {
      alert('Please provide both pickup and delivery addresses');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const res = await api.post('/delivery/create', {
        borrowRequestId: selectedRequest,
        pickupAddress: pickupAddress.trim(),
        deliveryAddress: deliveryAddress.trim()
      });

      alert('Delivery request created successfully! An agent will be assigned soon.');

      // Show verification code to user (if provided by API)
      const code = res?.data?.verificationCode;
      if (code) {
        setVerificationCode(code);
        setShowCode(true);
        // user will continue from the modal; don't navigate away yet
      } else {
        // no code returned - navigate back to requests
        router.push('/requests');
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to create delivery request');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isAuthenticated) return null;

  if (loading) {
    return <Layout><p>Loading...</p></Layout>;
  }

  return (
    <Layout>
      <div style={{ maxWidth: '800px', margin: '50px auto' }}>
        <h1>🚚 Request Delivery Service</h1>
        <p style={{ color: '#7f8c8d', marginBottom: '30px' }}>
          Request a delivery agent to pick up your borrowed book from the owner and deliver it to you.
        </p>

        <div style={{
          padding: '15px',
          background: '#e3f2fd',
          borderLeft: '4px solid #2196f3',
          borderRadius: '4px',
          marginBottom: '30px'
        }}>
          <strong>📋 How it works:</strong>
          <ol style={{ marginTop: '10px', marginBottom: 0, paddingLeft: '20px' }}>
            <li>Select your accepted borrow request</li>
            <li>Provide pickup address (book owner's location)</li>
            <li>Provide delivery address (your location)</li>
            <li>All delivery agents will see your request</li>
            <li>An agent will accept and deliver the book to you</li>
            <li>Track delivery status in real-time</li>
          </ol>
        </div>

        {error && (
          <div style={{
            padding: '15px',
            background: '#ffebee',
            color: '#c62828',
            borderRadius: '4px',
            marginBottom: '20px'
          }}>
            {error}
          </div>
        )}

        {/* Success Modal with Verification Code */}
        {showCode && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
          }}>
            <div style={{
              background: 'white',
              padding: '40px',
              borderRadius: '12px',
              maxWidth: '500px',
              textAlign: 'center',
              boxShadow: '0 10px 40px rgba(0,0,0,0.3)'
            }}>
              <div style={{ fontSize: '48px', marginBottom: '20px' }}>✅</div>
              <h2 style={{ margin: '0 0 20px 0', color: '#27ae60' }}>
                Delivery Request Created!
              </h2>
              
              <div style={{
                padding: '30px',
                background: '#f8f9fa',
                borderRadius: '8px',
                marginBottom: '20px'
              }}>
                <div style={{ 
                  fontSize: '14px', 
                  color: '#7f8c8d', 
                  marginBottom: '10px',
                  fontWeight: 'bold'
                }}>
                  YOUR VERIFICATION CODE
                </div>
                <div style={{
                  fontSize: '48px',
                  fontWeight: 'bold',
                  color: '#2c3e50',
                  letterSpacing: '8px',
                  fontFamily: 'monospace',
                  marginBottom: '15px'
                }}>
                  {verificationCode}
                </div>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(verificationCode);
                    alert('Code copied to clipboard!');
                  }}
                  style={{
                    padding: '8px 16px',
                    background: '#3498db',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '14px'
                  }}
                >
                  📋 Copy Code
                </button>
              </div>

              <div style={{
                padding: '15px',
                background: '#fff3cd',
                borderRadius: '8px',
                marginBottom: '20px',
                textAlign: 'left',
                fontSize: '14px'
              }}>
                <strong>⚠️ Important Instructions:</strong>
                <ul style={{ marginTop: '10px', marginBottom: 0, paddingLeft: '20px' }}>
                  <li>Save this code - you'll need it for delivery</li>
                  <li>Show this code ONLY to the delivery agent</li>
                  <li>Agent must verify this code before pickup</li>
                  <li>Don't share this code with anyone else</li>
                </ul>
              </div>

              <button
                onClick={() => {
                  setShowCode(false);
                  router.push('/requests');
                }}
                style={{
                  width: '100%',
                  padding: '12px',
                  background: '#27ae60',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '16px',
                  fontWeight: 'bold'
                }}
              >
                Continue to Requests
              </button>
            </div>
          </div>
        )}

        {borrowRequests.length === 0 ? (
          <div style={{
            padding: '60px 20px',
            textAlign: 'center',
            background: '#f8f9fa',
            borderRadius: '8px'
          }}>
            <p style={{ fontSize: '18px', color: '#7f8c8d' }}>
              No accepted borrow requests available for delivery.
            </p>
            <p style={{ color: '#95a5a6', marginTop: '10px' }}>
              You can request delivery once a borrow request has been accepted.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            {/* Select Borrow Request */}
            <div style={{ marginBottom: '25px' }}>
              <label style={{ display: 'block', marginBottom: '10px', fontWeight: 'bold' }}>
                Select Borrow Request
              </label>
              <select
                value={selectedRequest || ''}
                onChange={(e) => setSelectedRequest(Number(e.target.value))}
                required
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '14px'
                }}
              >
                <option value="">-- Choose a request --</option>
                {borrowRequests.map((request) => (
                  <option key={request.id} value={request.id}>
                    {request.book.title} by {request.book.author} - 
                    (From: {request.book.owner.name}, To: {request.borrower.name})
                  </option>
                ))}
              </select>
            </div>

            {/* Pickup Address */}
            <div style={{ marginBottom: '25px' }}>
              <label style={{ display: 'block', marginBottom: '10px', fontWeight: 'bold' }}>
                Pickup Address (Book Owner's Address)
              </label>
              <textarea
                value={pickupAddress}
                onChange={(e) => setPickupAddress(e.target.value)}
                placeholder="Enter the full pickup address including street, city, state, and postal code"
                required
                rows={3}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontFamily: 'inherit',
                  resize: 'vertical'
                }}
              />
            </div>

            {/* Delivery Address */}
            <div style={{ marginBottom: '25px' }}>
              <label style={{ display: 'block', marginBottom: '10px', fontWeight: 'bold' }}>
                Delivery Address (Borrower's Address)
              </label>
              <textarea
                value={deliveryAddress}
                onChange={(e) => setDeliveryAddress(e.target.value)}
                placeholder="Enter the full delivery address including street, city, state, and postal code"
                required
                rows={3}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontFamily: 'inherit',
                  resize: 'vertical'
                }}
              />
            </div>

            {/* Info Box */}
            <div style={{
              padding: '15px',
              background: '#e3f2fd',
              borderLeft: '4px solid #2196f3',
              borderRadius: '4px',
              marginBottom: '25px'
            }}>
              <strong>📋 How it works:</strong>
              <ol style={{ marginTop: '10px', marginBottom: 0, paddingLeft: '20px' }}>
                <li>A delivery agent will be assigned to your request</li>
                <li>The agent will pick up the book from the owner</li>
                <li>The book will be delivered to the borrower</li>
                <li>You can track the delivery status in real-time</li>
              </ol>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={submitting}
              style={{
                width: '100%',
                padding: '15px',
                background: submitting ? '#95a5a6' : '#27ae60',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: submitting ? 'not-allowed' : 'pointer',
                fontSize: '16px',
                fontWeight: 'bold',
                transition: 'background 0.2s'
              }}
            >
              {submitting ? 'Creating Request...' : '🚚 Request Delivery Service'}
            </button>
          </form>
        )}
      </div>
    </Layout>
  );
}