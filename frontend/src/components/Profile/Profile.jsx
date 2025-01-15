import React, { useState, useEffect } from 'react';
import './Profile.scss';
import api from "../../api";

const Profile = () => {
  // Track if any field has been edited
  const [isEdited, setIsEdited] = useState(false);

  // State to manage active page
  const [activePage, setActivePage] = useState('account');

  // Password States
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [repeatPassword, setRepeatPassword] = useState('');
  const [isPasswordValid, setIsPasswordValid] = useState(false);

  // Warning States
  const [currentPasswordWarning, setCurrentPasswordWarning] = useState('');
  const [newPasswordWarning, setNewPasswordWarning] = useState('');
  const [repeatPasswordWarning, setRepeatPasswordWarning] = useState('');

  // Loading and error states
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  // State to store profile details
  const [profileDetails, setProfileDetails] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
  });

  // state to store a copy of original state
  const [originalDetails, setOriginalDetails] = useState({ ...profileDetails });

  // Fetch profile details from the API
  useEffect(() => {
    const fetchProfileDetails = async () => {
      try {
        setIsLoading(true);
        const response = await api.get("api/user");

        setProfileDetails(response.data);
        setOriginalDetails(response.data);
        setIsLoading(false);
      } catch (err) {
        console.error("Error fetching profile details:", err);
        setError("Failed to load profile details. Please try again.");
        setIsLoading(false);
      }
    };

    fetchProfileDetails();
  }, []);

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;

    // Update profile details
    setProfileDetails((prevDetails) => ({
      ...prevDetails,
      [name]: value,
    }));

    // Check if any changes exist compared to the original state
    setIsEdited(Object.keys(profileDetails).some(
      (key) => profileDetails[key] !== originalDetails[key]
    ));
  };

  // handle save changes
  const saveDetails = async () => {
    try {
      const response = await api.put(`api/profile/update/`, profileDetails);
      console.log("Updated successfully:", response.data);
      setOriginalDetails(profileDetails); // Update the original state after saving
      setIsEdited(false);
    } catch (error) {
      console.error("Error updating profile:", error);
      alert(`Failed to update profile.`);
    }
  };

  // Cancel all changes
  const cancelChanges = () => {
    setProfileDetails({ ...originalDetails });
    setIsEdited(false); // Reset edit flag
  };

  /* ------------------------------- */
  /* -------- Password Part -------- */
  /* ------------------------------- */

  useEffect(() => {
    // Clear warnings initially
    setCurrentPasswordWarning('');
    setNewPasswordWarning('');
    setRepeatPasswordWarning('');

    // Validate current password
    if (currentPassword === '') {
      if (newPassword || repeatPassword) {
        setCurrentPasswordWarning('Mevcut Şifrenizi Girmeniz Gerekiyor');
      }
    }

    // Validate new password and repeat password
    if (newPassword && !repeatPassword) {
      setRepeatPasswordWarning('Şifrenizi tekrar girmeniz gerekiyor');
    } else if (newPassword && repeatPassword && newPassword !== repeatPassword) {
      setRepeatPasswordWarning('Yeni ve tekrar eden şifre aynı olmalı!');
    } else {
      setRepeatPasswordWarning('');
    }

    // Enable the save button only when all conditions are met
    setIsPasswordValid(
      currentPassword.trim() !== '' &&
      newPassword.trim() !== '' &&
      repeatPassword.trim() !== '' &&
      newPassword === repeatPassword
    );
  }, [currentPassword, newPassword, repeatPassword]);
  
  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
  
    if (name === 'currentPassword') setCurrentPassword(value);
    if (name === 'newPassword') setNewPassword(value);
    if (name === 'repeatPassword') setRepeatPassword(value);
  };

  const savePassword = async () => {
    try {
      const response = await api.put(`/api/profile/change-password/`, {
        currentPassword,
        newPassword,
      });
      alert('Password updated successfully');
      setCurrentPassword('');
      setNewPassword('');
      setRepeatPassword('');
      setIsPasswordValid(false);
    } catch (error) {
      console.error("Error updating password:", error);
      alert(`Failed to update password.`);
    }
  };

  /* ---------------------------------- */
  /* -------- Appointment Part -------- */
  /* ---------------------------------- */

  // State for appointments
  const [appointments, setAppointments] = useState([]);

  // Fetch appointments from API
  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        setIsLoading(true);
        setError("");
        const response = await api.get("/api/appointments");
        console.log("Fetched appointments:", response.data);
        setAppointments(response.data);
      } catch (err) {
        console.error("Error fetching appointments:", err);
        setError("Failed to load appointments. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    if (activePage === "appointments") {
      fetchAppointments();
    }
  }, [activePage]);

  const renderContent = () => {
    switch (activePage) {
      case 'account':
        return (
          <div className="container">
            <div className="card mt-4">
              <div className="card-body">
                {["first_name", "last_name", "email", "phone"].map((field) => (
                  <div key={field} className="form-group">
                    <label className="form-label">
                      {field.charAt(0).toUpperCase() + field.slice(1)}
                    </label>
                    <input
                      type="text"
                      name={field}
                      value={profileDetails[field]}
                      onChange={handleInputChange}
                      className="form-control"
                      style={{
                        border: profileDetails[field] !== originalDetails[field]
                          ? "2px solid red"
                          : "1px solid #ced4da",
                      }}
                    />
                  </div>
                ))}

                {/* Global Save and Cancel Buttons for Account */}
                <div className="d-flex justify-content-end mt-3">
                  <button
                    className="btn btn-success mr-2"
                    onClick={saveDetails}
                    disabled={!isEdited} // Disable Save if no edits
                    style={{
                      opacity: isEdited ? 1 : 0.5,
                      pointerEvents: isEdited ? "auto" : "none",
                    }}
                  >
                    Kaydet
                  </button>
                  <button
                    className="btn btn-secondary"
                    onClick={cancelChanges}
                    disabled={!isEdited} // Disable Cancel if no edits
                    style={{
                      opacity: isEdited ? 1 : 0.5,
                      pointerEvents: isEdited ? "auto" : "none",
                    }}
                  >
                    İptal
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      case 'password':
        return (
          <div>
            <h4>Şifreni Değiştir</h4>
            <div className="card-body">
              <div className="form-group">
                <label className="form-label">Mevcut Şifre</label>
                <input 
                  type="password"
                  name="currentPassword"
                  value={currentPassword}
                  onChange={handlePasswordChange}
                  className="form-control"
                />
                {currentPasswordWarning && (
                  <div className='text-danger mt-1'>{currentPasswordWarning}</div>
                )}
              </div>
              <div className="form-group">
                <label className="form-label">Yeni Şifre</label>
                <input
                  type="password"
                  name="newPassword"
                  value={newPassword}
                  onChange={handlePasswordChange}
                  className="form-control"
                />
                {newPasswordWarning && (
                  <div className="text-danger mt-1">{newPasswordWarning}</div>
                )}
              </div>
              <div className="form-group">
                <label className="form-label">Yeni Şifre Tekrarı</label>
                <input
                  type="password"
                  name="repeatPassword"
                  value={repeatPassword}
                  onChange={handlePasswordChange}
                  className="form-control"
                />
                {repeatPasswordWarning && (
                  <div className="text-danger mt-1">{repeatPasswordWarning}</div>
                )}
              </div>
              <div className='d-flex justify-content-end mt-2'>
                <button
                  className="btn btn-success mr-2"
                  onClick={savePassword}
                  disabled={!isPasswordValid}
                  style={{
                    opacity: isPasswordValid ? 1 : 0.5,
                    pointerEvents: isPasswordValid ? "auto" : "none",
                  }}
                >
                  Kaydet
                </button>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="container mt-5">
      <h4 className="font-weight-bold text-center">Profil Ayarları</h4>
      <div className="row mt-4">
        {/* Column layout */}
        <div className="col-md-6">
          <div
            className={`card text-center p-3 ${activePage === 'account' ? 'bg-primary text-white' : ''}`}
            onClick={() => setActivePage('account')}
            style={{ cursor: 'pointer' }}
          >
            <h5>Hesap</h5>
          </div>
        </div>
        <div className="col-md-6">
          <div
            className={`card text-center p-3 ${activePage === 'password' ? 'bg-primary text-white' : ''}`}
            onClick={() => setActivePage('password')}
            style={{ cursor: 'pointer' }}
          >
            <h5>Şifre</h5>
          </div>
        </div>
      </div>

      {/* Content section */}
      <div className="mt-4">
        <div className="card">
          <div className="card-body">{renderContent()}</div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
