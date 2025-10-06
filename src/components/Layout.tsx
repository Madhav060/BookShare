// src/components/Layout.tsx - FIXED ROLE-BASED NAVIGATION
import Link from "next/link";
import { ReactNode } from "react";
import { useAuth } from "../context/AuthContext";
import NotificationBell from "./NotificationBell";
import { useRouter } from "next/router";

export default function Layout({ children }: { children: ReactNode }) {
  const { user, logout, isAuthenticated, loading } = useAuth();
  const router = useRouter();

  const handleLogoClick = (e: React.MouseEvent) => {
    e.preventDefault();
    
    // Role-based redirection
    if (user?.role === 'DELIVERY_AGENT') {
      router.push('/agent/dashboard');
    } else if (user?.role === 'ADMIN') {
      router.push('/admin/dashboard');
    } else {
      router.push('/'); // Regular users go to home
    }
  };

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh' 
      }}>
        <div>Loading...</div>
      </div>
    );
  }

  return (
    <div>
      <nav style={{ padding: "10px 20px", background: "#2c3e50", color: "white" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", gap: "20px", alignItems: "center" }}>
            {/* FIXED: Role-based logo redirect */}
            <a 
              href="#" 
              onClick={handleLogoClick}
              style={{ 
                color: "white", 
                textDecoration: "none", 
                fontSize: "18px", 
                fontWeight: "bold",
                cursor: "pointer"
              }}
            >
              📚 BookShare
            </a>
            
            {isAuthenticated && (
              <>
                {/* Navigation for Regular Users */}
                {user?.role === 'USER' && (
                  <>
                    <Link href="/my-shelf" style={{ color: "white", textDecoration: "none" }}>
                      My Shelf
                    </Link>
                    <Link href="/requests" style={{ color: "white", textDecoration: "none" }}>
                      Requests
                    </Link>
                    <Link href="/add-book" style={{ color: "white", textDecoration: "none" }}>
                      Add Book
                    </Link>
                    <Link href="/delivery/request" style={{ color: "white", textDecoration: "none" }}>
                      📦 Request Delivery
                    </Link>
                    <Link href="/delivery/return" style={{ color: "white", textDecoration: "none" }}>
                      🔄 Return Book
                    </Link>
                    <Link href="/dashboard" style={{ color: "white", textDecoration: "none" }}>
                      Dashboard
                    </Link>
                  </>
                )}

                {/* Navigation for Delivery Agents - NO BOOK FEATURES */}
                {user?.role === 'DELIVERY_AGENT' && (
                  <>
                    <Link href="/agent/dashboard" style={{ color: "white", textDecoration: "none" }}>
                      🚚 My Deliveries
                    </Link>
                    <Link href="/agent/earnings" style={{ color: "white", textDecoration: "none" }}>
                      💰 Earnings
                    </Link>
                  </>
                )}

                {/* Navigation for Admins */}
                {user?.role === 'ADMIN' && (
                  <>
                    <Link href="/admin/dashboard" style={{ color: "white", textDecoration: "none" }}>
                      ⚙️ Admin Panel
                    </Link>
                    <Link href="/agent/dashboard" style={{ color: "white", textDecoration: "none" }}>
                      🚚 Deliveries
                    </Link>
                    <Link href="/dashboard" style={{ color: "white", textDecoration: "none" }}>
                      Dashboard
                    </Link>
                    <Link href="/my-shelf" style={{ color: "white", textDecoration: "none" }}>
                      My Shelf
                    </Link>
                  </>
                )}
              </>
            )}
          </div>

          <div style={{ display: "flex", gap: "20px", alignItems: "center" }}>
            {isAuthenticated ? (
              <>
                <NotificationBell />
                <span style={{ color: "white" }}>
                  {user?.name}
                  {user?.role !== 'USER' && (
                    <span style={{ 
                      marginLeft: '5px', 
                      padding: '2px 6px', 
                      background: user?.role === 'ADMIN' ? '#e74c3c' : '#27ae60',
                      borderRadius: '3px',
                      fontSize: '10px',
                      fontWeight: 'bold'
                    }}>
                      {user?.role === 'ADMIN' ? 'ADMIN' : 'AGENT'}
                    </span>
                  )}
                </span>
                <button 
                  onClick={logout}
                  style={{ 
                    padding: "5px 15px", 
                    cursor: "pointer",
                    background: "#e74c3c",
                    color: "white",
                    border: "none",
                    borderRadius: "4px"
                  }}
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link href="/login" style={{ color: "white", textDecoration: "none" }}>
                  Login
                </Link>
                <Link href="/register" style={{ color: "white", textDecoration: "none" }}>
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>
      <main style={{ padding: "20px", maxWidth: "1200px", margin: "0 auto" }}>
        {children}
      </main>
    </div>
  );
}