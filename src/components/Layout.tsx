// src/components/Layout.tsx - UPDATED WITH NOTIFICATIONS
import Link from "next/link";
import { ReactNode } from "react";
import { useAuth } from "../context/AuthContext";
import NotificationBell from "./NotificationBell";

export default function Layout({ children }: { children: ReactNode }) {
  const { user, logout, isAuthenticated } = useAuth();

  return (
    <div>
      <nav style={{ padding: "10px 20px", background: "#2c3e50", color: "white" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", gap: "20px", alignItems: "center" }}>
            <Link href="/" style={{ color: "white", textDecoration: "none", fontSize: "18px", fontWeight: "bold" }}>
              📚 BookShare
            </Link>
            {isAuthenticated && (
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
                <Link href="/dashboard" style={{ color: "white", textDecoration: "none" }}>
                  Dashboard
                </Link>
                {user?.role === 'DELIVERY_AGENT' && (
                  <Link href="/agent/dashboard" style={{ color: "white", textDecoration: "none" }}>
                    🚚 Deliveries
                  </Link>
                )}
                {user?.role === 'ADMIN' && (
                  <Link href="/admin/dashboard" style={{ color: "white", textDecoration: "none" }}>
                    ⚙️ Admin
                  </Link>
                )}
              </>
            )}
          </div>
          <div style={{ display: "flex", gap: "20px", alignItems: "center" }}>
            {isAuthenticated ? (
              <>
                <NotificationBell />
                <Link href={`/profile/${user?.id}`} style={{ color: "white", textDecoration: "none" }}>
                  {user?.name}
                </Link>
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