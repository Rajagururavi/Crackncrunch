"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
export default function AdminLogin() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const handleLogin = async (e) => {
    e.preventDefault();
    setMessage("Logging in...");
    try {
      const response = await fetch("/api/admin/login", {
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
      if (data.success) {
        router.push("/admin/dashboard");
      } else {
        setMessage(data.message);
      }
    } catch (error) {
      setMessage("Something went wrong");
    }
  };
  return (
    <>
      <style jsx>{`
        * {
          box-sizing: border-box;
        }
        .login-page {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #f5f5f5;
          padding: 20px;
        }
        .login-box {
          width: 100%;
          max-width: 420px;
          background: #ffffff;
          padding: 40px;
          border-radius: 12px;
          box-shadow: 0 8px 30px rgba(0, 0, 0, 0.08);
        }
        .title {
          text-align: center;
          margin-bottom: 8px;
          font-size: 28px;
          font-weight: 700;
          color: #222;
        }
        .subtitle {
          text-align: center;
          margin-bottom: 30px;
          color: #777;
          font-size: 14px;
        }
        .form-group {
          margin-bottom: 20px;
        }
        .form-group label {
          display: block;
          margin-bottom: 8px;
          font-size: 14px;
          font-weight: 600;
          color: #333;
        }
        .form-group input {
          width: 100%;
          height: 46px;
          padding: 0 14px;
          border: 1px solid #ddd;
          border-radius: 7px;
          font-size: 15px;
          outline: none;
          color: #000;
        }
        .form-group input:focus {
          border-color: #222;
          box-shadow: 0 0 0 3px rgba(0, 0, 0, 0.06);
        }
        .login-button {
          width: 100%;
          height: 46px;
          border: none;
          border-radius: 7px;
          background: #222;
          color: #fff;
          font-size: 15px;
          font-weight: 600;
          cursor: pointer;
          transition: 0.2s;
        }
        .login-button:hover {
          background: #000;
        }
        .message {
          text-align: center;
          margin-top: 18px;
          font-size: 14px;
          color: #d32f2f;
        }
        @media (max-width: 480px) {
          .login-box {
            padding: 30px 22px;
          }
          .title {
            font-size: 24px;
          }
        }
      `}
      </style>
      <div className="login-page">
        <div className="login-box">
          <h1 className="title">Admin Login</h1>
          <p className="subtitle">Login to access the admin panel</p>
          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label>Username</label>
              <input type="text" placeholder="Enter username" value={username} onChange={(e) => setUsername(e.target.value)} required />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input type="password" placeholder="Enter password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>
            <button type="submit" className="login-button">Login</button>
          </form>
          {message && (<p className="message">{message}</p>)}
        </div>
      </div>
    </>
  );
}