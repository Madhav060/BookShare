import api from "../utils/api";

const MY_USER_ID = 2; // replace with logged-in user

export default function BookCard({ book }: { book: any }) {
  const handleBorrow = async () => {
    await api.post("/borrow", {
      bookId: book.id,
      borrowerId: MY_USER_ID,
      ownerId: book.ownerId,
    });
    alert("Borrow request sent!");
  };

  return (
    <div style={{ border: "1px solid #ddd", margin: "10px", padding: "10px" }}>
      <h3>{book.title}</h3>
      <p>Author: {book.author}</p>
      <p>Status: {book.status}</p>
      <p>Owner: {book.owner?.name}</p>
      <p>Holder: {book.holder?.name}</p>
      {book.status === "available" && book.ownerId !== MY_USER_ID && (
        <button onClick={handleBorrow}>Borrow</button>
      )}
    </div>
  );
}
