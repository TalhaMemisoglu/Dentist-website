import React, { useState } from "react";
import api from "../../api";
import Navbar from '../../components/Navbar/Navbar';
import Footer from '../../sections/Footer/Footer';
import { useParams } from "react-router-dom";

const ResetPassword = () => {
  const { uid, token } = useParams(); // Extract UID and token from the URL
  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(""); // Clear previous messages

    try {
      await api.post(`/api/password-reset/${uid}/${token}/`, {
        new_password: newPassword,
      });
      setMessage("Şifre başarıyla sıfırlandı.");
    } catch (error) {
      if (error.response) {
        setMessage(`Hata: ${error.response.data.error || "Bir hata oluştu."}`);
      } else {
        setMessage("Şifre sıfırlama bağlantısı geçersiz olabilir.");
      }
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
          <h2 style={{ marginBottom: "20px" }}>Yeni Şifrenizi Girin</h2>
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: "20px", textAlign: "left" }}>
              <input
                type="password"
                id="newPassword"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                placeholder="Buraya yeni şifrenizi girin"
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
              {loading ? "Sıfırlanıyor..." : "Şifreyi Sıfırla"}
            </button>
          </form>
          {message && (
            <p
              style={{
                marginTop: "15px",
                color: message.includes("Hata") ? "red" : "green",
              }}
            >
              {message}
            </p>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
};

export default ResetPassword;