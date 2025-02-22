import React, { useState, useEffect, useRef } from "react";
import api from "../../api";
import "./JenericAppointments.scss";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash } from "@fortawesome/free-solid-svg-icons";
import CustomAlert from '../CustomAlert/CustomAlert';

const PatientAppointments = () => {
  const [activeAppointments, setActiveAppointments] = useState([]);
  const [pastAppointments, setPastAppointments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandCancel, setExpandCancel] = useState(null);
  const [alert, setAlert] = useState({ message: '', type: '' });
  const [userType, setUserType] = useState(null);

  // Add a ref to store the timer
  const shrinkTimer = useRef(null);

  // Add user type check at the beginning
  useEffect(() => {
    const fetchUserType = async () => {
      try {
        const response = await api.get("/api/user/");
        setUserType(response.data.user_type);
      } catch (error) {
        console.error("Error fetching user type:", error);
      }
    };
    fetchUserType();
  }, []);

  // Function to handle trash bin click and start shrinking process
  const handleTrashClick = (id) => {
    setExpandCancel(id);

    // Clear any existing timer
    if (shrinkTimer.current) {
      clearTimeout(shrinkTimer.current);
    }

    // Start countdown timer and store the reference
    shrinkTimer.current = setTimeout(() => {
      setExpandCancel(null); // Shrink back to trash bin if no further action
    }, 3000);
  };

  // Function to cancel an appointment
  const cancelAppointment = async (id) => {
    try {
      // Clear the shrink timer immediately when canceling
      if (shrinkTimer.current) {
        clearTimeout(shrinkTimer.current);
      }
      
      await api.delete(`/api/booking/appointments/${id}/cancel/`);
      setExpandCancel(null);
      setAlert({ message: "Randevu iptal edildi!", type: "success" });
      
      setTimeout(() => {
        window.location.reload();
      }, 3000); // alert visible for 3 seconds
    } catch (error) {
      console.error("Failed to cancel appointment:", error);
      setAlert({ message: "Randevu iptal edilemedi. Lütfen tekrar deneyin.", type: "error" });
    }
  };

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        setIsLoading(true);
        setError("");
        
        // Use different endpoints based on user type
        const endpoint = userType === 'dentist'
          ? "/api/booking/appointments/dentist-calendar"
          : "/api/booking/appointments";
        const response = await api.get(endpoint);
        
        if (userType === 'dentist') {
          // Handle dentist calendar format
          const appointments = response.data.map(apt => ({
            id: apt.id,
            appointment_date: apt.start.split('T')[0],
            appointment_time: apt.start.split('T')[1].substring(0, 5),
            status: apt.status,
            treatment_name: apt.treatment,
            patient_name: apt.patient_name,
            // Calculate duration from start and end times
            duration: Math.round((new Date(apt.end) - new Date(apt.start)) / 1000 / 60)
          }));

          const now = new Date();
          const active = [];
          const past = [];
          
          appointments.forEach(apt => {
            const appointmentDateTime = new Date(`${apt.appointment_date}T${apt.appointment_time}`);
            if (appointmentDateTime >= now && apt.status.toLowerCase() === 'scheduled') {
              active.push(apt);
            } else {
              past.push(apt);
            }
          });

          // Sort both arrays by date
          const sortByDate = (a, b) => 
            new Date(`${a.appointment_date}T${a.appointment_time}`) - 
            new Date(`${b.appointment_date}T${b.appointment_time}`);

          setActiveAppointments(active.sort(sortByDate));
          setPastAppointments(past.sort(sortByDate));
        } else {
          // Existing patient appointments handling
          const appointments = Array.isArray(response.data.appointments) 
            ? response.data.appointments 
            : [];

          const now = new Date();
          
          // Split and sort appointments
          const active = [];
          const past = [];
          
          appointments.forEach(apt => {
            const appointmentDateTime = new Date(`${apt.appointment_date}T${apt.appointment_time}`);
            if (appointmentDateTime >= now && apt.status.toLowerCase() === 'scheduled') {
              active.push(apt);
            } else {
              past.push(apt);
            }
          });

          // Sort both arrays by date
          const sortByDate = (a, b) => 
            new Date(`${a.appointment_date}T${a.appointment_time}`) - 
            new Date(`${b.appointment_date}T${b.appointment_time}`);

          setActiveAppointments(active.sort(sortByDate));
          setPastAppointments(past.sort(sortByDate));
        }
      } catch (err) {
        console.error("Error fetching appointments:", err);
        setError("Failed to load appointments. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    if (userType) {
      fetchAppointments();
    }
  }, [userType]);

  return (
    <div className="appointments-container">
      <CustomAlert 
        message={alert.message}
        type={alert.type}
        onClose={() => setAlert({ message: '', type: '' })}
      />
      <h4 className="appointments-title">Tüm Randevuların</h4>
      <div className="appointments-content">
        {isLoading ? (
          <p>Tüm Randevular yükleniyor...</p>
        ) : error ? (
          <p className="error-message">{error}</p>
        ) : activeAppointments.length === 0 && pastAppointments.length === 0 ? (
          <p className="no-appointments">Randevu bulunamadı.</p>
        ) : (
          <>
            {/* Active Appointments Section */}
            {activeAppointments.length > 0 && (
              <>
                <h5 className="section-title">Aktif Randevular</h5>
                {activeAppointments.map((appointment, index) => (
                  <div key={`active-${index}`} className="appointment-card">
                    {/* Header Section */}
                    <div className="appointment-header">
                      <div className="date-time">
                        <p className="appointment-date">
                          {new Date(appointment.appointment_date).toLocaleDateString("tr", {
                            weekday: "long",
                            day: "numeric",
                            month: "short",
                          })},{" "}
                          {new Date(`1970-01-01T${appointment.appointment_time}`).toLocaleTimeString(
                            "tr",
                            {
                              hour: "2-digit",
                              minute: "2-digit",
                              hour12: false,
                            }
                          )}
                        </p>
                      </div>
                      {/* Status Section */}
                      <div className="status">
                        {appointment.status.toLowerCase() === "scheduled" && (
                          <>
                            <span className="status-dot scheduled"></span>
                            <span className="status scheduled">Aktif Randevu</span>
                          </>
                        )}
                        {appointment.status.toLowerCase() === "cancelled" && (
                          <>
                            <span className="status-dot cancelled"></span>
                            <span className="status cancelled">İptal Edildi</span>
                          </>
                        )}
                        {appointment.status.toLowerCase() === "completed" && (
                          <>
                            <span className="status-dot completed"></span>
                            <span className="status completed">Tamamlandı</span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Body Section */}
                    <div className="appointment-body">
                      <div className="appointment-info">
                        <p className="appointment-treatment">
                          Tedavi: <strong>{appointment.treatment_name || "Kanal Tedavi"}</strong>
                        </p>
                        <p className="appointment-duration">
                          Süre: <strong>{appointment.duration || "N/A"} dakika</strong>
                        </p>
                      </div>
                      <p className="appointment-doctor">
                        {userType === 'dentist' ? (
                          <>Hasta: <strong>{appointment.patient_name || "Unknown"}</strong></>
                        ) : (
                          <>Doktor: <strong>{appointment.dentist_name || "Unknown"}</strong></>
                        )}
                      </p>
                    </div>

                    {/* Trash Bin Icon */}
                    {appointment.status.toLowerCase() === 'scheduled' && (
                      <div className="cancel-container">
                        <button
                          className={`trash-button ${expandCancel === appointment.id ? "expanded" : ""}`}
                          onClick={() => handleTrashClick(appointment.id)}
                        >
                          <FontAwesomeIcon icon={faTrash} />
                          {expandCancel === appointment.id && (
                            <span className="cancel-text" onClick={() => cancelAppointment(appointment.id)}>
                              İptal Et
                            </span>
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </>
            )}

            {/* Separator - only show if both sections have appointments */}
            {activeAppointments.length > 0 && pastAppointments.length > 0 && (
              <div className="appointments-separator"></div>
            )}

            {/* Past Appointments Section */}
            {pastAppointments.length > 0 && (
              <>
                <h5 className="section-title">Geçmiş Randevular</h5>
                {pastAppointments.map((appointment, index) => (
                  <div key={`past-${index}`} className="appointment-card">
                    {/* Header Section */}
                    <div className="appointment-header">
                      <div className="date-time">
                        <p className="appointment-date">
                          {new Date(appointment.appointment_date).toLocaleDateString("tr", {
                            weekday: "long",
                            day: "numeric",
                            month: "short",
                          })},{" "}
                          {new Date(`1970-01-01T${appointment.appointment_time}`).toLocaleTimeString(
                            "tr",
                            {
                              hour: "2-digit",
                              minute: "2-digit",
                              hour12: false,
                            }
                          )}
                        </p>
                      </div>
                      {/* Status Section */}
                      <div className="status">
                        {appointment.status.toLowerCase() === "scheduled" && (
                          <>
                            <span className="status-dot scheduled"></span>
                            <span className="status scheduled">Aktif Randevu</span>
                          </>
                        )}
                        {appointment.status.toLowerCase() === "cancelled" && (
                          <>
                            <span className="status-dot cancelled"></span>
                            <span className="status cancelled">İptal Edildi</span>
                          </>
                        )}
                        {appointment.status.toLowerCase() === "completed" && (
                          <>
                            <span className="status-dot completed"></span>
                            <span className="status completed">Tamamlandı</span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Body Section */}
                    <div className="appointment-body">
                      <div className="appointment-info">
                        <p className="appointment-treatment">
                          Tedavi: <strong>{appointment.treatment_name || "Kanal Tedavi"}</strong>
                        </p>
                        <p className="appointment-duration">
                          Süre: <strong>{appointment.duration || "N/A"} dakika</strong>
                        </p>
                      </div>
                      <p className="appointment-doctor">
                        {userType === 'dentist' ? (
                          <>Hasta: <strong>{appointment.patient_name || "Unknown"}</strong></>
                        ) : (
                          <>Doktor: <strong>{appointment.dentist_name || "Unknown"}</strong></>
                        )}
                      </p>
                    </div>

                    {/* Trash Bin Icon */}
                    {appointment.status.toLowerCase() === 'scheduled' && (
                      <div className="cancel-container">
                        <button
                          className={`trash-button ${expandCancel === appointment.id ? "expanded" : ""}`}
                          onClick={() => handleTrashClick(appointment.id)}
                        >
                          <FontAwesomeIcon icon={faTrash} />
                          {expandCancel === appointment.id && (
                            <span className="cancel-text" onClick={() => cancelAppointment(appointment.id)}>
                              İptal Et
                            </span>
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default PatientAppointments;