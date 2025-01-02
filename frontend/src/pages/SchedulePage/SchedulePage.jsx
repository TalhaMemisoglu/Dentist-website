import React from "react";
import Schedule from "../../components/Schedule/Schedule";
import Sidebar from "../../components/Sidebar/Sidebar";
import "./SchedulePage.scss";

const SchedulePage = () => {
  return (
    <div className="schedule-page-container">
      <div className="sidebar-wrapper">
        <Sidebar />
      </div>
      <div className="schedule-wrapper">
        <Schedule />
      </div>
    </div>
  );
};

export default SchedulePage;
