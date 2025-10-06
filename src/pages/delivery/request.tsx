// src/pages/delivery/request.tsx - FIXED SESSION PERSISTENCE WITH PAYMENT FLOW
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
  const [dataLoading, setDataLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  
  // Payment & Code states
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [deliveryId, setDeliveryId] = useState<number | null>(null);
  const [verificationCode, setVerificationCode] = useState('');
  const [paymentAmount, setPaymentAmount] = useState(50);
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [processingPayment, setProcessingPayment] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    
    loadAcceptedRequests();
  }, [isAuthenticated, loading, router]);

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
      setDataLoading(false);
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

      // Store delivery info and show payment modal
      setDeliveryId(res.data.delivery.id);
      setVerificationCode(res.data.verificationCode);
      setPaymentAmount(res.data.paymentAmount || 50);
      setShowPaymentModal(true);
      
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to create delivery request');
    } finally {
      setSubmitting(false);
    }
  };

  const handlePayment = async () => {
    if (!deliveryId) return;

    setProcessingPayment(true);
    setError('');

    try {
      const res = await api.post(`/delivery/${deliveryId}/payment`, {
        paymentMethod
      });

      // Payment successful - show success modal
      setShowPaymentModal(false);
      setShowSuccessModal(true);
      
    } catch (err: any) {
      setError(err.response?.data?.error || 'Payment failed. Please try again.');
    } finally {
      setProcessingPayment(false);
    }
  };

  const copyCode = () => {
    navigator.clipboard.writeText(verificationCode);
    alert('Verification code copied to clipboard!');
  };

  if (loading) {
    return <Layout><p>Loading...</p></Layout>;
  }

  if (!isAuthenticated) {
    return null;
  }

  if (dataLoading) {
    return <Layout><p>Loading...</p></Layout>;
  }

  return (
    <Layout>
      <div style={{ maxWidth: '800px', margin: '50px auto' }}>
        <h1>🚚 Request Delivery Service</h1>
        <p style={{ color: '#7f8c8d', marginBottom: '30px' }}>
          Request a delivery agent to pick up your borrowed book and deliver it to you.
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
            <li>Provide pickup & delivery addresses</li>
            <li><strong>Pay delivery fee (₹50)</strong></li>
            <li>Get 6-digit verification code</li>
            <li>Agent accepts and contacts you</li>
            <li>Share code with agent for pickup</li>
            <li>Track delivery in real-time</li>
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
                    "{request.book.title}" by {request.book.author} (Owner: {request.book.owner.name})
                  </option>
                ))}
              </select>
            </div>

            <div style={{ marginBottom: '25px' }}>
              <label style={{ display: 'block', marginBottom: '10px', fontWeight: 'bold' }}>
                Pickup Address (Book Owner's Location)
              </label>
              <textarea
                value={pickupAddress}
                onChange={(e) => setPickupAddress(e.target.value)}
                placeholder="Enter the complete pickup address with landmarks"
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

            <div style={{ marginBottom: '25px' }}>
              <label style={{ display: 'block', marginBottom: '10px', fontWeight: 'bold' }}>
                Delivery Address (Your Location)
              </label>
              <textarea
                value={deliveryAddress}
                onChange={(e) => setDeliveryAddress(e.target.value)}
                placeholder="Enter your complete address with landmarks"
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

            <div style={{
              padding: '15px',
              background: '#fff3cd',
              borderRadius: '4px',
              marginBottom: '25px',
              fontSize: '14px'
            }}>
              <strong>💰 Delivery Fee: ₹50</strong>
              <p style={{ margin: '10px 0 0 0' }}>
                You'll be asked to pay after creating the delivery request.
              </p>
            </div>

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
                fontWeight: 'bold'
              }}
            >
              {submitting ? 'Creating Request...' : '🚚 Continue to Payment'}
            </button>
          </form>
        )}

        {/* Payment Modal */}
        {showPaymentModal && (
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
              width: '90%',
              maxHeight: '90vh',
              overflowY: 'auto'
            }}>
              <h2 style={{ marginTop: 0, color: '#2c3e50' }}>💳 Complete Payment</h2>
              
              <div style={{
                padding: '20px',
                background: '#e3f2fd',
                borderRadius: '8px',
                marginBottom: '25px',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '14px', color: '#7f8c8d', marginBottom: '5px' }}>
                  Delivery Fee
                </div>
                <div style={{ fontSize: '36px', fontWeight: 'bold', color: '#2c3e50' }}>
                  ₹{paymentAmount}
                </div>
              </div>

              <div style={{ marginBottom: '25px' }}>
                <label style={{ display: 'block', marginBottom: '10px', fontWeight: 'bold' }}>
                  Select Payment Method
                </label>
                
                {['card', 'upi', 'wallet'].map((method) => (
                  <label
                    key={method}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      padding: '15px',
                      border: paymentMethod === method ? '2px solid #3498db' : '2px solid #ddd',
                      borderRadius: '8px',
                      marginBottom: '10px',
                      cursor: 'pointer',
                      background: paymentMethod === method ? '#e3f2fd' : 'white'
                    }}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value={method}
                      checked={paymentMethod === method}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      style={{ marginRight: '10px' }}
                    />
                    <span style={{ fontSize: '20px', marginRight: '10px' }}>
                      {method === 'card' ? '💳' : method === 'upi' ? '📱' : '👛'}
                    </span>
                    <div>
                      <div style={{ fontWeight: 'bold' }}>
                        {method === 'card' ? 'Card' : method === 'upi' ? 'UPI' : 'Wallet'}
                      </div>
                      <div style={{ fontSize: '12px', color: '#7f8c8d' }}>
                        {method === 'card' ? 'Credit/Debit Card' : 
                         method === 'upi' ? 'Google Pay, PhonePe' : 'Paytm, Amazon Pay'}
                      </div>
                    </div>
                  </label>
                ))}
              </div>

              <div style={{
                padding: '15px',
                background: '#fff3cd',
                borderRadius: '4px',
                marginBottom: '20px',
                fontSize: '13px'
              }}>
                <strong>⚠️ Demo Mode:</strong> This is a dummy payment for demonstration. 
                Click Pay Now to simulate payment.
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

              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  onClick={() => {
                    setShowPaymentModal(false);
                    router.push('/requests');
                  }}
                  style={{
                    flex: 1,
                    padding: '12px',
                    background: '#95a5a6',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={handlePayment}
                  disabled={processingPayment}
                  style={{
                    flex: 2,
                    padding: '12px',
                    background: processingPayment ? '#95a5a6' : '#27ae60',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: processingPayment ? 'not-allowed' : 'pointer',
                    fontWeight: 'bold'
                  }}
                >
                  {processingPayment ? 'Processing...' : `Pay ₹${paymentAmount}`}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Success Modal with Verification Code */}
        {showSuccessModal && (
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
              <div style={{ fontSize: '64px', marginBottom: '20px' }}>✅</div>
              <h2 style={{ margin: '0 0 20px 0', color: '#27ae60' }}>
                Payment Successful!
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
                  onClick={copyCode}
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
                <strong>⚠️ IMPORTANT:</strong>
                <ul style={{ marginTop: '10px', marginBottom: 0, paddingLeft: '20px' }}>
                  <li>Save this code securely</li>
                  <li>Share ONLY with the delivery agent</li>
                  <li>Agent must verify before pickup</li>
                  <li>Don't share with anyone else</li>
                </ul>
              </div>

              <button
                onClick={() => {
                  setShowSuccessModal(false);
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
                Continue to My Requests
              </button>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}