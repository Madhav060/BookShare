// src/pages/login.tsx - COMPLETE VERSION
import { useState } from 'react';
import { useRouter } from 'next/router';
import api, { setAuthToken } from '../utils/api';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await api.post('/auth/login', form);
      const { user, token } = res.data;
      
      // Set token in API utility
      setAuthToken(token);
      
      // Update auth context
      login(user, token);
      
      // Redirect based on role
      if (user.role === 'DELIVERY_AGENT') {
        router.push('/agent/dashboard');
      } else if (user.role === 'ADMIN') {
        router.push('/admin/dashboard');
      } else {
        router.push('/');
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div style={{ maxWidth: '500px', margin: '50px auto' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <h1 style={{ fontSize: '32px', marginBottom: '10px' }}>🔑 Welcome Back</h1>
          <p style={{ color: '#7f8c8d', fontSize: '16px' }}>
            Login to access your BookShare account
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div style={{ 
            padding: '15px', 
            background: '#ffebee', 
            color: '#c62828', 
            borderRadius: '8px',
            marginBottom: '20px',
            border: '1px solid #ef9a9a',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}>
            <span style={{ fontSize: '20px' }}>⚠️</span>
            <span>{error}</span>
          </div>
        )}

        {/* Login Form */}
        <div style={{
          background: 'white',
          padding: '30px',
          borderRadius: '12px',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
          border: '1px solid #e0e0e0'
        }}>
          <form onSubmit={handleSubmit}>
            {/* Email Field */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ 
                display: 'block', 
                marginBottom: '8px',
                fontWeight: '600',
                color: '#2c3e50',
                fontSize: '14px'
              }}>
                Email Address
              </label>
              <input
                type="email"
                placeholder="Enter your email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
                style={{
                  width: '100%',
                  padding: '12px 15px',
                  border: '2px solid #e0e0e0',
                  borderRadius: '8px',
                  fontSize: '15px',
                  transition: 'border-color 0.3s',
                  outline: 'none'
                }}
                onFocus={(e) => e.target.style.borderColor = '#3498db'}
                onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
              />
            </div>

            {/* Password Field */}
            <div style={{ marginBottom: '25px' }}>
              <label style={{ 
                display: 'block', 
                marginBottom: '8px',
                fontWeight: '600',
                color: '#2c3e50',
                fontSize: '14px'
              }}>
                Password
              </label>
              <input
                type="password"
                placeholder="Enter your password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
                style={{
                  width: '100%',
                  padding: '12px 15px',
                  border: '2px solid #e0e0e0',
                  borderRadius: '8px',
                  fontSize: '15px',
                  transition: 'border-color 0.3s',
                  outline: 'none'
                }}
                onFocus={(e) => e.target.style.borderColor = '#3498db'}
                onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
              />
            </div>

            {/* Login Button */}
            <button 
              type="submit" 
              disabled={loading}
              style={{
                width: '100%',
                padding: '14px',
                background: loading ? '#95a5a6' : 'linear-gradient(135deg, #3498db 0%, #2980b9 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: loading ? 'not-allowed' : 'pointer',
                fontSize: '16px',
                fontWeight: '600',
                transition: 'transform 0.2s, box-shadow 0.2s',
                boxShadow: loading ? 'none' : '0 4px 12px rgba(52, 152, 219, 0.3)'
              }}
              onMouseEnter={(e) => {
                if (!loading) {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 6px 16px rgba(52, 152, 219, 0.4)';
                }
              }}
              onMouseLeave={(e) => {
                if (!loading) {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(52, 152, 219, 0.3)';
                }
              }}
            >
              {loading ? (
                <span>🔄 Logging in...</span>
              ) : (
                <span>Login to BookShare</span>
              )}
            </button>
          </form>
        </div>

        {/* Divider */}
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          margin: '30px 0',
          gap: '15px'
        }}>
          <div style={{ flex: 1, height: '1px', background: '#e0e0e0' }}></div>
          <span style={{ color: '#95a5a6', fontSize: '14px' }}>OR</span>
          <div style={{ flex: 1, height: '1px', background: '#e0e0e0' }}></div>
        </div>

        {/* Registration Options */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          {/* Regular User Registration */}
          <a 
            href="/register"
            style={{
              display: 'block',
              padding: '15px 20px',
              background: 'white',
              border: '2px solid #3498db',
              borderRadius: '8px',
              textDecoration: 'none',
              textAlign: 'center',
              transition: 'all 0.3s',
              cursor: 'pointer'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#3498db';
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(52, 152, 219, 0.3)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'white';
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <div style={{ fontSize: '24px', marginBottom: '5px' }}>📚</div>
            <div style={{ 
              fontWeight: '600', 
              fontSize: '15px',
              color: '#2c3e50'
            }}>
              Register as User
            </div>
            <div style={{ 
              fontSize: '12px', 
              color: '#7f8c8d',
              marginTop: '3px'
            }}>
              Borrow and lend books
            </div>
          </a>

          {/* Delivery Agent Registration */}
          <a 
            href="/register-agent"
            style={{
              display: 'block',
              padding: '15px 20px',
              background: 'white',
              border: '2px solid #27ae60',
              borderRadius: '8px',
              textDecoration: 'none',
              textAlign: 'center',
              transition: 'all 0.3s',
              cursor: 'pointer'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#27ae60';
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(39, 174, 96, 0.3)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'white';
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <div style={{ fontSize: '24px', marginBottom: '5px' }}>🚚</div>
            <div style={{ 
              fontWeight: '600', 
              fontSize: '15px',
              color: '#2c3e50'
            }}>
              Register as Delivery Agent
            </div>
            <div style={{ 
              fontSize: '12px', 
              color: '#7f8c8d',
              marginTop: '3px'
            }}>
              Earn by delivering books
            </div>
          </a>
        </div>

        {/* Info Box */}
        <div style={{
          marginTop: '30px',
          padding: '15px',
          background: '#e8f5e9',
          borderLeft: '4px solid #27ae60',
          borderRadius: '4px',
          fontSize: '13px',
          color: '#2c3e50'
        }}>
          <strong>✨ New to BookShare?</strong>
          <ul style={{ marginTop: '8px', marginBottom: 0, paddingLeft: '20px' }}>
            <li>Browse thousands of books in your area</li>
            <li>Borrow books for free from other users</li>
            <li>Become a delivery agent and earn money</li>
          </ul>
        </div>
      </div>
    </Layout>
  );
}