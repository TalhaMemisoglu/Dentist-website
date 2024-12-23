import React, { useState, useEffect } from "react";
import api from "../../api";
import "./PatientAppointments.scss";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash } from "@fortawesome/free-solid-svg-icons";

const PatientAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [expandCancel, setExpandCancel] = useState(null);

  // Function to handle trash bin click and start shrinking process
  const handleTrashClick = (id) => {
    setExpandCancel(id);

    // Start countdown timer
    setTimeout(() => {
      setExpandCancel(null); // Shrink back to trash bin if no further action
    }, 3000);
  };

  // Function to cancel an appointment
  const cancelAppointment = async (id) => {
    try {
      await api.delete(`/api/booking/appointments/${id}/cancel/`);
      setAppointments((prevAppointments) =>
        prevAppointments.filter((appointment) => appointment.id !== id)
      );
      setExpandCancel(null);

      // sayfayi yenile
      window.location.reload();
    } catch (error) {
      console.error("Failed to cancel appointment:", error);
      alert("Randevu iptal edilemedi. Tekrar deneyin.");
    }
  };

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        setIsLoading(true);
        setError("");
        const response = await api.get("/api/booking/appointments");
        console.log("Fetched appointments:", response.data);

        setAppointments(
          Array.isArray(response.data.appointments)
            ? response.data.appointments
            : []
        );
      } catch (err) {
        console.error("Error fetching appointments:", err);
        setError("Failed to load appointments. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchAppointments();
  }, []);

  return (
    <div className="appointments-container">
      <h4 className="appointments-title">Tüm Randevuların</h4>
      <div className="appointments-content">
        {isLoading ? (
          <p>Tüm Randevular yükleniyor...</p>
        ) : error ? (
          <p className="error-message">{error}</p>
        ) : appointments.length === 0 ? (
          <p className="no-appointments">Randevu bulunamadı.</p>
        ) : (
          appointments.map((appointment, index) => (
            <div key={index} className="appointment-card">
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
                  Doktor: <strong>{appointment.dentist_name || "Unknown"}</strong>
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
          ))
        )}
      </div>
    </div>
  );
};

export default PatientAppointments;