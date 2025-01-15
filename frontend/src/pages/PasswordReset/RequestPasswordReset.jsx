import React, { useState } from "react";
import Navbar from '../../components/Navbar/Navbar';
import Footer from '../../sections/Footer/Footer';
import api from "../../api";

const RequestPasswordReset = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false); // Added missing state

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await api.post("/api/password-reset-request/", { email });
      alert("Şifre sıfırlama maili gönderildi.");
    } catch (error) {
      alert("Mail gönderilirken hata yaşandı. Lütfen tekrar deneyin.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
    <Navbar />
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
          backgroundColor: "#f7f7f7",
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: "400px",
            backgroundColor: "#fff",
            padding: "20px",
            borderRadius: "20px",
            boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
            textAlign: "center",
          }}
        >
          <h2 style={{ marginBottom: "20px" }}>Şifreni mi unuttun? 🤣</h2>
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: "20px", textAlign: "left" }}>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="Mailine sıfırlama linki gönderelim"
                style={{
                  width: "100%",
                  padding: "10px",
                  border: "1px solid #ccc",
                  borderRadius: "5px",
                }}
              />
            </div>
            <button
              type="submit"
              style={{
                width: "100%",
                padding: "10px",
                fontSize: "16px",
                backgroundColor: "#0590D4",
                color: "#fff",
                border: "none",
                borderRadius: "5px",
                cursor: "pointer",
                transition: "background-color 0.3s",
              }}
              onMouseOver={(e) => (
                e.target.style.backgroundColor = "#fff",
                e.target.style.color = "#0590D4",
                e.target.style.boxShadow = "0 0 0 2px #0590D4 inset"
              )}
              onMouseOut={(e) => (
                e.target.style.backgroundColor = "#0590D4",
                e.target.style.color = "#fff"
              )}
            >
              Gönder
            </button>
          </form>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default RequestPasswordReset;