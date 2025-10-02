import { useEffect, useState } from "react";
import api from "../utils/api";
import Layout from "../components/Layout";

const MY_USER_ID = 2; // TODO: replace with logged-in user

export default function Borrowed() {
  const [books, setBooks] = useState<any[]>([]);

  useEffect(() => {
    api.get("/books").then((res) => {
      setBooks(
        res.data.filter(
          (b: any) => b.userId === MY_USER_ID && b.ownerId !== MY_USER_ID
        )
      );
    });
  }, []);

  const handleReturn = async (requestId: number) => {
    await api.put("/borrow", { id: requestId, action: "return" });
    alert("Book returned!");
  };

  return (
    <Layout>
      <h1>📦 Borrowed Books</h1>
      {books.map((book) => (
        <div key={book.id}>
          <h3>{book.title}</h3>
          <p>Owner: {book.owner?.name}</p>
          {/* once we extend API to include borrowRequests */}
          {book.borrowRequests?.[0] && (
            <button onClick={() => handleReturn(book.borrowRequests[0].id)}>
              Return
            </button>
          )}
        </div>
      ))}
    </Layout>
  );
}
