"use client";
import LoginButton from "../components/authentication/LoginButton";

export default function Admin() {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #e0e7ff 0%, #f8fafc 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          background: "white",
          padding: "2.5rem 2rem",
          borderRadius: "1.25rem",
          boxShadow: "0 8px 32px rgba(31, 41, 55, 0.15)",
          minWidth: 340,
          textAlign: "center",
        }}
      >
        <h1
          style={{
            fontSize: "2.5rem",
            fontWeight: 700,
            marginBottom: "1rem",
            color: "#1e293b",
            letterSpacing: "-1px",
          }}
        >
          Welcome
        </h1>
        <p
          style={{
            fontSize: "1.1rem",
            color: "#475569",
            marginBottom: "2rem",
          }}
        >
          Sign in with Google
        </p>
        <LoginButton />
      </div>
    </div>
  );
}
