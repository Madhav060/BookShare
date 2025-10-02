import Link from "next/link";
import { ReactNode } from "react";

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <div>
      <nav style={{ padding: "10px", background: "#eee" }}>
        <Link href="/">Home</Link> |{" "}
        <Link href="/my-books">My Books</Link> |{" "}
        <Link href="/borrowed">Borrowed</Link> |{" "}
        <Link href="/login">Login</Link> |{" "}
        <Link href="/register">Register</Link>
        <Link href="/add-book">Add Book</Link> |{" "}
      </nav>
      <main style={{ padding: "20px" }}>{children}</main>
    </div>
  );
}
