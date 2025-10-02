import { useState } from "react";
import api from "../utils/api";
import Layout from "../components/Layout";

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    const res = await api.post("/login", form);
    alert(`Welcome ${res.data.name}`);
    // TODO: Save user session (JWT / localStorage)
  };

  return (
    <Layout>
      <h1>🔑 Login</h1>
      <form onSubmit={handleSubmit}>
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
        <button type="submit">Login</button>
      </form>
    </Layout>
  );
}
