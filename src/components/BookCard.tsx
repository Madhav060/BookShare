export default function BookCard({ book }: { book: any }) {
  return (
    <div style={{ border: "1px solid #ddd", margin: "10px", padding: "10px" }}>
      <h3>{book.title}</h3>
      <p>Author: {book.author}</p>
      <p>Status: {book.status}</p>
      <p>Owner: {book.owner?.name}</p>
      <p>Holder: {book.holder?.name}</p>
    </div>
  );
}
