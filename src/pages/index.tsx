// src/pages/index.tsx - UPDATED WITH SEARCH
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Layout from "../components/Layout";
import SearchBar from "../components/SearchBar";
import api from "../utils/api";
import Link from "next/link";
import { Book, Category } from "../types";

export default function Home() {
  const [books, setBooks] = useState<Book[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('recent');
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const router = useRouter();

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    loadBooks();
  }, [router.query, selectedCategory, sortBy, page]);

  const loadCategories = async () => {
    try {
      const res = await api.get('/categories');
      setCategories(res.data);
    } catch (err) {
      console.error('Error loading categories:', err);
    }
  };

  const loadBooks = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      
      if (router.query.q) params.append('q', router.query.q as string);
      if (selectedCategory) params.append('category', selectedCategory);
      params.append('sortBy', sortBy);
      params.append('page', page.toString());
      params.append('limit', '12');

      const res = await api.get(`/books/search?${params.toString()}`);
      setBooks(res.data.data);
      setTotalPages(res.data.totalPages);
    } catch (err) {
      console.error("Error loading books:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (query: string) => {
    router.push(`/?q=${encodeURIComponent(query)}`);
    setPage(1);
  };

  return (
    <Layout>
      <div>
        <h1>📖 Browse Books</h1>
        <p style={{ color: "#666", marginBottom: "20px" }}>
          Discover and borrow books from our community
        </p>

        {/* Search Bar */}
        <SearchBar onSearch={handleSearch} />

        {/* Filters */}
        <div style={{ 
          display: 'flex', 
          gap: '15px', 
          marginBottom: '30px',
          flexWrap: 'wrap',
          alignItems: 'center'
        }}>
          <div>
            <label style={{ marginRight: '10px', fontWeight: 'bold' }}>Category:</label>
            <select
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                setPage(1);
              }}
              style={{
                padding: '8px 12px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '14px'
              }}
            >
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.name}>{cat.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ marginRight: '10px', fontWeight: 'bold' }}>Sort by:</label>
            <select
              value={sortBy}
              onChange={(e) => {
                setSortBy(e.target.value);
                setPage(1);
              }}
              style={{
                padding: '8px 12px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '14px'
              }}
            >
              <option value="recent">Most Recent</option>
              <option value="popular">Most Popular</option>
              <option value="rating">Highest Rated</option>
            </select>
          </div>

          {(router.query.q || selectedCategory) && (
            <button
              onClick={() => {
                router.push('/');
                setSelectedCategory('');
                setPage(1);
              }}
              style={{
                padding: '8px 15px',
                background: '#e74c3c',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              Clear Filters
            </button>
          )}
        </div>

        {/* Results Count */}
        {router.query.q && (
          <p style={{ marginBottom: '20px', color: '#7f8c8d' }}>
            Search results for "<strong>{router.query.q}</strong>"
          </p>
        )}

        {loading ? (
          <p>Loading books...</p>
        ) : books.length === 0 ? (
          <div style={{ 
            padding: '60px 20px', 
            textAlign: 'center', 
            background: '#f8f9fa', 
            borderRadius: '8px' 
          }}>
            <p style={{ fontSize: '18px', color: '#7f8c8d' }}>
              No books found. {router.query.q ? 'Try a different search term.' : 'Be the first to add one!'}
            </p>
            <Link href="/add-book">
              <a style={{
                display: 'inline-block',
                marginTop: '15px',
                padding: '10px 20px',
                background: '#3498db',
                color: 'white',
                textDecoration: 'none',
                borderRadius: '4px'
              }}>
                Add a Book
              </a>
            </Link>
          </div>
        ) : (
          <>
            {/* Books Grid */}
            <div style={{ 
              display: "grid", 
              gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", 
              gap: "20px",
              marginBottom: "30px"
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
                    transition: "transform 0.2s, box-shadow 0.2s",
                    cursor: "pointer"
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-5px)';
                    e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.15)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
                  }}
                >
                  {book.coverImage && (
                    <div style={{
                      width: '100%',
                      height: '200px',
                      background: `url(${book.coverImage}) center/cover`,
                      borderRadius: '4px',
                      marginBottom: '15px'
                    }} />
                  )}
                  <h3 style={{ marginTop: 0, color: "#2c3e50" }}>{book.title}</h3>
                  <p style={{ color: "#7f8c8d", fontSize: "14px", marginBottom: '10px' }}>
                    by {book.author}
                  </p>
                  
                  {book.categories && book.categories.length > 0 && (
                    <div style={{ marginBottom: '10px' }}>
                      {book.categories.slice(0, 2).map((bc) => (
                        <span
                          key={bc.categoryId}
                          style={{
                            display: 'inline-block',
                            padding: '3px 8px',
                            background: '#e3f2fd',
                            color: '#1976d2',
                            fontSize: '11px',
                            borderRadius: '3px',
                            marginRight: '5px',
                            marginBottom: '5px'
                          }}
                        >
                          {bc.category?.name}
                        </span>
                      ))}
                    </div>
                  )}

                  <p style={{ fontSize: "12px", color: "#95a5a6", marginBottom: '10px' }}>
                    Owner: {book.owner?.name}
                  </p>

                  {(book as any).averageRating > 0 && (
                    <div style={{ marginBottom: '10px', fontSize: '14px' }}>
                      {'⭐'.repeat(Math.round((book as any).averageRating))}
                      <span style={{ marginLeft: '5px', color: '#7f8c8d' }}>
                        ({(book as any).averageRating})
                      </span>
                    </div>
                  )}

                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginTop: '15px'
                  }}>
                    <div style={{ fontSize: '11px', color: '#95a5a6' }}>
                      👁️ {book.viewCount} views
                    </div>
                    <Link 
                      href={`/books/${book.id}`}
                      style={{
                        display: "inline-block",
                        padding: "8px 16px",
                        background: "#3498db",
                        color: "white",
                        textDecoration: "none",
                        borderRadius: "4px",
                        fontSize: "14px",
                        fontWeight: "bold"
                      }}
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div style={{ 
                display: 'flex', 
                justifyContent: 'center', 
                gap: '10px',
                marginTop: '30px'
              }}>
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  style={{
                    padding: '10px 20px',
                    background: page === 1 ? '#ddd' : '#3498db',
                    color: page === 1 ? '#999' : 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: page === 1 ? 'not-allowed' : 'pointer',
                    fontWeight: 'bold'
                  }}
                >
                  Previous
                </button>

                <div style={{ 
                  padding: '10px 20px',
                  background: '#f8f9fa',
                  borderRadius: '4px',
                  display: 'flex',
                  alignItems: 'center'
                }}>
                  Page {page} of {totalPages}
                </div>

                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  style={{
                    padding: '10px 20px',
                    background: page === totalPages ? '#ddd' : '#3498db',
                    color: page === totalPages ? '#999' : 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: page === totalPages ? 'not-allowed' : 'pointer',
                    fontWeight: 'bold'
                  }}
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </Layout>
  );
}