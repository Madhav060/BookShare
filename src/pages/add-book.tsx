import { useState } from "react";
import api from "../utils/api";
import Layout from "../components/Layout";

const MY_USER_ID = 1; // TODO: replace with logged-in user

export default function AddBook() {
  const [form, setForm] = useState({ title: "", author: "" });

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    await api.post("/books", { ...form, ownerId: MY_USER_ID });
    alert("Book added successfully!");
    setForm({ title: "", author: "" });
  };

  return (
    <Layout>
      <h1>➕ Add a Book</h1>
      <form onSubmit={handleSubmit}>
        <input
          placeholder="Title"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
        /><br />
        <input
          placeholder="Author"
          value={form.author}
          onChange={(e) => setForm({ ...form, author: e.target.value })}
        /><br />
        <button type="submit">Add Book</button>
      </form>
    </Layout>
  );
}
