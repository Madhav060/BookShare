// src/pages/index.tsx
import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import api from "../utils/api";
import Link from "next/link";
import { useAuth } from "../context/AuthContext";

interface Book {
  id: number;
  title: string;
  author: string;
  status: string;
  owner: {
    id: number;
    name: string;
  };
}

export default function Home() {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    loadBooks();
  }, []);

  const loadBooks = async () => {
    try {
      const res = await api.get("/books");
      setBooks(res.data);
    } catch (err) {
      console.error("Error loading books:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Layout><p>Loading books...</p></Layout>;
  }

  return (
    <Layout>
      <h1>📖 Available Books</h1>
      <p style={{ color: "#666", marginBottom: "20px" }}>
        Browse and borrow books from our community
      </p>

      {books.length === 0 ? (
        <p>No books available at the moment. Be the first to add one!</p>
      ) : (
        <div style={{ 
          display: "grid", 
          gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", 
          gap: "20px" 
        }}>
          {books.map((book) => (
            <div
              key={book.id}
              style={{
                border: "1px solid #ddd",
                borderRadius: "8px",
                padding: "20px",
                background: "white",
                boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
              }}
            >
              <h3 style={{ marginTop: 0, color: "#2c3e50" }}>{book.title}</h3>
              <p style={{ color: "#7f8c8d", fontSize: "14px" }}>
                by {book.author}
              </p>
              <p style={{ fontSize: "12px", color: "#95a5a6" }}>
                Owner: {book.owner.name}
              </p>
              <div style={{ marginTop: "15px" }}>
                <Link 
                  href={`/books/${book.id}`}
                  style={{
                    display: "inline-block",
                    padding: "8px 16px",
                    background: "#3498db",
                    color: "white",
                    textDecoration: "none",
                    borderRadius: "4px",
                    fontSize: "14px"
                  }}
                >
                  View Details
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </Layout>
  );
}