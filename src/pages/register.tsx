import { useState } from "react";
import api from "../utils/api";
import Layout from "../components/Layout";

export default function Register() {
  const [form, setForm] = useState({ name: "", email: "", password: "" });

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    await api.post("/users", form);
    alert("User registered successfully!");
  };

  return (
    <Layout>
      <h1>📝 Register</h1>
      <form onSubmit={handleSubmit}>
        <input
          placeholder="Name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        /><br />
        <input
          placeholder="Email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        /><br />
        <input
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
        /><br />
        <button type="submit">Register</button>
      </form>
    </Layout>
  );
}
