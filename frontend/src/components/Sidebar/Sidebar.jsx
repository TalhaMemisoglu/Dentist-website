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
        } else {
          console.error(`Unexpected status code: ${response.status}`);
        }
      } catch (error) {
        if (error.response) {
          // Server responded with a status other than 2xx
          console.error("Error response from server:", error.response);
      
          if (error.response.status === 401) {
            // Unauthorized: Token might be invalid or expired
            localStorage.removeItem(ACCESS_TOKEN); // Clear invalid token
            navigate("/login"); // Redirect to login
          } else if (error.response.status === 403) {
            // Forbidden: User doesn't have access
            console.error("Access forbidden. User might lack permissions.");
          } else if (error.response.status === 500) {
            // Internal Server Error
            console.error("Server error. Please try again later.");
          } else {
            console.error(`Unhandled status code: ${error.response.status}`);
          }
        } else if (error.request) {
          // No response received from server
          console.error("No response received from server:", error.request);
        } else {
          // Something happened while setting up the request
          console.error("Error setting up the request:", error.message);
        }
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
                <Link to="/schedule-page" className={location.pathname === "/schedule-page" ? "active" : ""}>
                  <span className="icon">📅</span> Takvimi Gör
                </Link>
              </li>
              <li>
                <Link to="/appointments-page" className={location.pathname === "/appointments-page" ? "active" : ""}>
                  <span className="icon">➕</span> Randevu Geçmişi
                </Link>
              </li>
            </>
          )}
          {userType === "patient" && (
            <>
              <li>
                <Link to="/appointments-page" className={location.pathname === "/appointments-page" ? "active" : ""}>
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
                <Link to="/schedule-page" className={location.pathname === "/schedule-page" ? "active" : ""}>
                  <span className="icon">📅</span> Takvimi Gör
                </Link>
              </li>
            </>
          )}
          {userType === "manager" && (
            <>
              <li>
                <Link to="/schedule-page" className={location.pathname === "/schedule-page" ? "active" : ""}>
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