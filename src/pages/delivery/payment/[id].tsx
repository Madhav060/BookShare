// src/pages/delivery/payment/[id].tsx
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import api from '../../../utils/api';
import Layout from '../../../components/Layout';
import { useAuth } from '../../../context/AuthContext';

export default function DeliveryPayment() {
  const [delivery, setDelivery] = useState<any>(null);
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
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
    }
  }, [isAuthenticated, id]);

  const loadDelivery = async () => {
    try {
      const res = await api.get(`/delivery/track/${id}`);
      setDelivery(res.data);
      
      // Check if payment already completed
      if (res.data.paymentStatus === 'COMPLETED') {
        setError('Payment already completed for this delivery');
      }
      
      // Check if code is verified
      if (!res.data.codeVerifiedAt) {
        setError('Verification code must be validated before payment');
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load delivery');
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setProcessing(true);
    setError('');

    try {
      const res = await api.post(`/delivery/${id}/payment`, {
        paymentMethod
      });

      alert('Payment successful! Your delivery will be processed.');
      router.push(`/delivery/track/${id}`);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Payment failed');
    } finally {
      setProcessing(false);
    }
  };

  if (!isAuthenticated) return null;

  if (loading) {
    return <Layout><p>Loading...</p></Layout>;
  }

  if (error && !delivery) {
    return (
      <Layout>
        <div style={{ maxWidth: '600px', margin: '50px auto', textAlign: 'center' }}>
          <div style={{ padding: '40px', background: '#ffebee', borderRadius: '8px' }}>
            <h2 style={{ color: '#c62828' }}>❌ {error}</h2>
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

  return (
    <Layout>
      <div style={{ maxWidth: '600px', margin: '50px auto' }}>
        <h1>💳 Payment Gateway</h1>
        
        {/* Delivery Summary */}
        <div style={{
          padding: '20px',
          background: 'white',
          border: '1px solid #ddd',
          borderRadius: '8px',
          marginBottom: '30px'
        }}>
          <h2 style={{ marginTop: 0 }}>Delivery Summary</h2>
          <div style={{ marginBottom: '10px' }}>
            <strong>Delivery ID:</strong> #{delivery?.id}
          </div>
          <div style={{ marginBottom: '10px' }}>
            <strong>Status:</strong> {delivery?.status}
          </div>
          <div style={{ marginBottom: '10px' }}>
            <strong>Pickup:</strong> {delivery?.pickupAddress}
          </div>
          <div style={{ marginBottom: '10px' }}>
            <strong>Delivery:</strong> {delivery?.deliveryAddress}
          </div>
          {delivery?.codeVerifiedAt && (
            <div style={{
              marginTop: '15px',
              padding: '10px',
              background: '#d4edda',
              borderRadius: '4px',
              color: '#155724'
            }}>
              ✓ Verification code confirmed
            </div>
          )}
        </div>

        {/* Payment Form */}
        <form onSubmit={handlePayment}>
          <div style={{
            padding: '30px',
            background: 'white',
            border: '1px solid #ddd',
            borderRadius: '8px'
          }}>
            <h2 style={{ marginTop: 0 }}>Payment Details</h2>

            {/* Amount */}
            <div style={{
              padding: '20px',
              background: '#e3f2fd',
              borderRadius: '8px',
              marginBottom: '25px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '14px', color: '#7f8c8d', marginBottom: '5px' }}>
                Amount to Pay
              </div>
              <div style={{ fontSize: '36px', fontWeight: 'bold', color: '#2c3e50' }}>
                ₹{delivery?.paymentAmount || 50}
              </div>
            </div>

            {/* Payment Method */}
            <div style={{ marginBottom: '25px' }}>
              <label style={{ display: 'block', marginBottom: '10px', fontWeight: 'bold' }}>
                Select Payment Method
              </label>
              
              {/* Card */}
              <label style={{
                display: 'flex',
                alignItems: 'center',
                padding: '15px',
                border: paymentMethod === 'card' ? '2px solid #3498db' : '2px solid #ddd',
                borderRadius: '8px',
                marginBottom: '10px',
                cursor: 'pointer',
                background: paymentMethod === 'card' ? '#e3f2fd' : 'white'
              }}>
                <input
                  type="radio"
                  name="paymentMethod"
                  value="card"
                  checked={paymentMethod === 'card'}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  style={{ marginRight: '10px' }}
                />
                <span style={{ fontSize: '20px', marginRight: '10px' }}>💳</span>
                <div>
                  <div style={{ fontWeight: 'bold' }}>Credit/Debit Card</div>
                  <div style={{ fontSize: '12px', color: '#7f8c8d' }}>
                    Visa, Mastercard, RuPay
                  </div>
                </div>
              </label>

              {/* UPI */}
              <label style={{
                display: 'flex',
                alignItems: 'center',
                padding: '15px',
                border: paymentMethod === 'upi' ? '2px solid #3498db' : '2px solid #ddd',
                borderRadius: '8px',
                marginBottom: '10px',
                cursor: 'pointer',
                background: paymentMethod === 'upi' ? '#e3f2fd' : 'white'
              }}>
                <input
                  type="radio"
                  name="paymentMethod"
                  value="upi"
                  checked={paymentMethod === 'upi'}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  style={{ marginRight: '10px' }}
                />
                <span style={{ fontSize: '20px', marginRight: '10px' }}>📱</span>
                <div>
                  <div style={{ fontWeight: 'bold' }}>UPI</div>
                  <div style={{ fontSize: '12px', color: '#7f8c8d' }}>
                    Google Pay, PhonePe, Paytm
                  </div>
                </div>
              </label>

              {/* Wallet */}
              <label style={{
                display: 'flex',
                alignItems: 'center',
                padding: '15px',
                border: paymentMethod === 'wallet' ? '2px solid #3498db' : '2px solid #ddd',
                borderRadius: '8px',
                cursor: 'pointer',
                background: paymentMethod === 'wallet' ? '#e3f2fd' : 'white'
              }}>
                <input
                  type="radio"
                  name="paymentMethod"
                  value="wallet"
                  checked={paymentMethod === 'wallet'}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  style={{ marginRight: '10px' }}
                />
                <span style={{ fontSize: '20px', marginRight: '10px' }}>👛</span>
                <div>
                  <div style={{ fontWeight: 'bold' }}>Digital Wallet</div>
                  <div style={{ fontSize: '12px', color: '#7f8c8d' }}>
                    Paytm, Amazon Pay, etc.
                  </div>
                </div>
              </label>
            </div>

            {/* Dummy Notice */}
            <div style={{
              padding: '15px',
              background: '#fff3cd',
              border: '1px solid #ffc107',
              borderRadius: '4px',
              marginBottom: '20px',
              fontSize: '13px'
            }}>
              <strong>⚠️ Demo Mode:</strong> This is a dummy payment gateway for demonstration purposes. 
              No actual payment will be processed. Click "Pay Now" to simulate payment.
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

            {/* Submit Button */}
            <button
              type="submit"
              disabled={processing}
              style={{
                width: '100%',
                padding: '15px',
                background: processing ? '#95a5a6' : '#27ae60',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: 'bold',
                cursor: processing ? 'not-allowed' : 'pointer'
              }}
            >
              {processing ? 'Processing...' : `Pay ₹${delivery?.paymentAmount || 50}`}
            </button>

            {/* Security Badge */}
            <div style={{
              marginTop: '20px',
              textAlign: 'center',
              fontSize: '12px',
              color: '#7f8c8d'
            }}>
              🔒 Secured by 256-bit SSL encryption
            </div>
          </div>
        </form>
      </div>
    </Layout>
  );
}