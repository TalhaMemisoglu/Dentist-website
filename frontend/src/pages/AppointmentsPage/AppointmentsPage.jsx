import React from "react";
import Sidebar from "../../components/Sidebar/Sidebar";
import JenericAppointments from "../../components/JenericAppointments/JenericAppointments";
import "./AppointmentsPage.scss";

const AppointmentsPage = () => {
  return (
    <div className="patient-appointments-page-container">
      {/* Sidebar Section */}
      <div className="sidebar-wrapper">
        <Sidebar />
      </div>

      {/* Patient Appointments Section */}
      <div className="appointments-wrapper">
        <JenericAppointments />
      </div>
    </div>
  );
};

export default AppointmentsPage;