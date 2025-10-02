import { useEffect, useState } from "react";
import api from "../utils/api";
import Layout from "../components/Layout";

const MY_USER_ID = 1; // TODO: replace with logged-in user ID

export default function MyBooks() {
  const [books, setBooks] = useState<any[]>([]);

  useEffect(() => {
    api.get("/books").then((res) => {
      setBooks(res.data.filter((b: any) => b.ownerId === MY_USER_ID));
    });
  }, []);

  return (
    <Layout>
      <h1>📖 My Books</h1>
      {books.map((book) => (
        <div key={book.id}>
          <h3>{book.title}</h3>
          <p>Status: {book.status}</p>
        </div>
      ))}
    </Layout>
  );
}
