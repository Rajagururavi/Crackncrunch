"use client";

import { useState } from "react";

export default function AdminSetup() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const createAdmin = async (e) => {
    e.preventDefault();

    setMessage("Creating admin...");

    const response = await fetch("/api/admin/setup", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username,
        password,
      }),
    });

    const data = await response.json();

    setMessage(data.message);
  };

  return (
    <div>
      <h1>Create Admin</h1>

      <form onSubmit={createAdmin}>
        <input
          type="text"
          placeholder="Admin Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />

        <br /><br />

        <input
          type="password"
          placeholder="Admin Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <br /><br />

        <button type="submit">Create Admin</button>
      </form>

      <p>{message}</p>
    </div>
  );
}