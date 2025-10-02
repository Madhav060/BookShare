import { useState } from "react";
import api from "../utils/api";
import Layout from "../components/Layout";
import { useRouter } from "next/router";

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.post("/login", form);
      const user = res.data;

      // Save session (for MVP using localStorage)
      localStorage.setItem("user", JSON.stringify(user));

      // ✅ redirect (await makes sure it happens)
      await router.push("/");
    } catch (err: any) {
      alert(err.response?.data?.error || "Login failed");
    }
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
