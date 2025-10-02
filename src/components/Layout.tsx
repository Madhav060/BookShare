// src/components/Layout.tsx
import Link from "next/link";
import { ReactNode } from "react";
import { useAuth } from "../context/AuthContext";

export default function Layout({ children }: { children: ReactNode }) {
  const { user, logout, isAuthenticated } = useAuth();

  return (
    <div>
      <nav style={{ padding: "10px 20px", background: "#2c3e50", color: "white" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", gap: "20px" }}>
            <Link href="/" style={{ color: "white", textDecoration: "none" }}>
              🏠 Home
            </Link>
            {isAuthenticated && (
              <>
                <Link href="/my-shelf" style={{ color: "white", textDecoration: "none" }}>
                  📚 My Shelf
                </Link>
                <Link href="/requests" style={{ color: "white", textDecoration: "none" }}>
                  📋 Requests
                </Link>
                <Link href="/add-book" style={{ color: "white", textDecoration: "none" }}>
                  ➕ Add Book
                </Link>
              </>
            )}
          </div>
          <div style={{ display: "flex", gap: "20px", alignItems: "center" }}>
            {isAuthenticated ? (
              <>
                <span>Welcome, {user?.name}!</span>
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