import React, { useState, useEffect } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom"; // Added useLocation
import axios from "axios";
import "./Sidebar.scss";
import profilePhoto from "../../assets/about/team/1.png";
import { ACCESS_TOKEN } from "../../constants";

const USER_TYPE_LABELS = {
  dentist: "Dentist",
  patient: "Patient",
  assistant: "Assistant",
  manager: "Manager",
};

const Sidebar = () => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const location = useLocation(); // Get current path

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const token = localStorage.getItem(ACCESS_TOKEN);
        if (!token) {
          navigate("/login");
          return;
        }
        const response = await axios.get("/api/user/", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.status === 200) {
          setUser(response.data);
        }
      } catch (error) {
        console.error("Error fetching user data:", error.response || error.message);
      }
    };

    fetchUserInfo();
  }, [navigate]);

  if (!user) return <p>Loading...</p>;

  const { user_type: userType, first_name: firstName, last_name: lastName } = user;

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <button className="home-button" onClick={() => navigate("/")}>
          <span className="home-icon">🏠</span> Anasayfa
        </button>
      </div>
      <div className="profile-section">
        <div className="profile-image">
          <img src={profilePhoto} alt="Profile" />
        </div>
        <p className="user-name">{firstName} {lastName}</p>
        <p className="user-role">{USER_TYPE_LABELS[userType] || "Unknown"}</p>
      </div>
      <div className="sidebar-links">
        <ul>
          {userType === "dentist" && (
            <>
              <li>
                <Link to="/appointments" className={location.pathname === "/appointments" ? "active" : ""}>
                  <span className="icon">📅</span> Takvimi Gör
                </Link>
              </li>
              <li>
                <Link to="/add-appointment" className={location.pathname === "/add-appointment" ? "active" : ""}>
                  <span className="icon">➕</span> Randevu Geçmişi
                </Link>
              </li>
            </>
          )}
          {userType === "patient" && (
            <>
              <li>
                <Link to="/patient-appointments-page" className={location.pathname === "/patient-appointments-page" ? "active" : ""}>
                  <span className="icon">📅</span> Randevularım
                </Link>
              </li>
              <li>
                <Link to="/choose" className={location.pathname === "/choose" ? "active" : ""}>
                  <span className="icon">📅</span> Randevu Al
                </Link>
              </li>
            </>
          )}
          {userType === "assistant" && (
            <>
              <li>
                <Link to="/#" className={location.pathname === "/#" ? "active" : ""}>
                  <span className="icon">📅</span> Takvimi Gör
                </Link>
              </li>
            </>
          )}
          {userType === "manager" && (
            <>
              <li>
                <Link to="/#" className={location.pathname === "/#" ? "active" : ""}>
                  <span className="icon">📅</span> Takvimi Gör
                </Link>
              </li>
              <li>
                <Link to="/addremove" className={location.pathname === "/#" ? "active" : ""}>
                  <span className="icon">➕</span> Personel Ekle/Çıkar
                </Link>
              </li>
            </>
          )}

          <li>
            <Link to="/profile-page" className={location.pathname === "/profile-page" ? "active" : ""}>
              <span className="icon">⚙️</span> Profil
            </Link>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default Sidebar;