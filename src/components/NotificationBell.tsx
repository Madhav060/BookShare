// src/components/NotificationBell.tsx
import { useState, useEffect, useRef } from 'react';
import api from '../utils/api';
import { Notification } from '../types';

export default function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadNotifications();
    // Poll for new notifications every 30 seconds
    const interval = setInterval(loadNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Close dropdown when clicking outside
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const loadNotifications = async () => {
    try {
      const res = await api.get('/notifications?limit=10');
      setNotifications(res.data.data);
      setUnreadCount(res.data.unreadCount);
    } catch (err) {
      console.error('Error loading notifications:', err);
    }
  };

  const markAsRead = async (id: number) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      setNotifications(prev =>
        prev.map(n => n.id === id ? { ...n, isRead: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'BORROW_REQUEST': return '📬';
      case 'REQUEST_ACCEPTED': return '✅';
      case 'REQUEST_REJECTED': return '❌';
      case 'BOOK_RETURNED': return '📚';
      case 'DELIVERY_ASSIGNED': return '🚚';
      case 'DELIVERY_PICKED_UP': return '📦';
      case 'DELIVERY_DELIVERED': return '✓';
      case 'NEW_REVIEW': return '⭐';
      default: return '🔔';
    }
  };

  const getTimeAgo = (date: Date) => {
    const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);
    
    if (seconds < 60) return 'just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  };

  return (
    <div style={{ position: 'relative' }} ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          position: 'relative',
          background: 'transparent',
          border: 'none',
          color: 'white',
          cursor: 'pointer',
          fontSize: '24px',
          padding: '5px 10px'
        }}
      >
        🔔
        {unreadCount > 0 && (
          <span
            style={{
              position: 'absolute',
              top: '0',
              right: '0',
              background: '#e74c3c',
              color: 'white',
              borderRadius: '50%',
              width: '20px',
              height: '20px',
              fontSize: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 'bold'
            }}
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div
          style={{
            position: 'absolute',
            top: '100%',
            right: '0',
            marginTop: '10px',
            width: '350px',
            maxHeight: '500px',
            background: 'white',
            border: '1px solid #ddd',
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            overflowY: 'auto',
            zIndex: 1000
          }}
        >
          <div
            style={{
              padding: '15px',
              borderBottom: '1px solid #ddd',
              fontWeight: 'bold',
              color: '#2c3e50',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}
          >
            <span>Notifications</span>
            {unreadCount > 0 && (
              <span style={{ fontSize: '12px', color: '#7f8c8d' }}>
                {unreadCount} unread
              </span>
            )}
          </div>

          {notifications.length === 0 ? (
            <div style={{ padding: '40px 20px', textAlign: 'center', color: '#95a5a6' }}>
              No notifications yet
            </div>
          ) : (
            notifications.map((notification) => (
              <div
                key={notification.id}
                onClick={() => !notification.isRead && markAsRead(notification.id)}
                style={{
                  padding: '15px',
                  borderBottom: '1px solid #f0f0f0',
                  cursor: notification.isRead ? 'default' : 'pointer',
                  background: notification.isRead ? 'white' : '#e3f2fd',
                  transition: 'background 0.2s'
                }}
              >
                <div style={{ display: 'flex', gap: '10px' }}>
                  <div style={{ fontSize: '24px' }}>
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div
                      style={{
                        fontWeight: notification.isRead ? 'normal' : 'bold',
                        color: '#2c3e50',
                        marginBottom: '5px',
                        fontSize: '14px'
                      }}
                    >
                      {notification.title}
                    </div>
                    <div style={{ color: '#7f8c8d', fontSize: '13px', marginBottom: '5px' }}>
                      {notification.message}
                    </div>
                    <div style={{ color: '#95a5a6', fontSize: '11px' }}>
                      {getTimeAgo(notification.createdAt)}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}

          {notifications.length > 0 && (
            <div
              style={{
                padding: '10px',
                textAlign: 'center',
                borderTop: '1px solid #ddd'
              }}
            >
              <a
                href="/notifications"
                style={{
                  color: '#3498db',
                  textDecoration: 'none',
                  fontSize: '13px'
                }}
              >
                View all notifications
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  );
}