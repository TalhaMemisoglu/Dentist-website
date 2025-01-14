import React from "react";
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import './App.scss';
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Home from './pages/Home';
import About from './pages/About';
import Services from './pages/Services';
import Contactus from './pages/Contact/Contactus';
import Register from './pages/Register/Register';
import Login from './pages/Login/Login';
import Patients from './pages/Patients/Patients';
import Choose from './pages/Choose/Choose';
import NotFound from "./pages/NotFound";
import ProtectedRoute from "./components/ProtectedRoute";
import Appointment from './pages/Appointment/Appointment'
import VerifyEmail from './pages/VerifyEmail'
import RequestPasswordReset from './pages/PasswordReset/RequestPasswordReset'
import ResetPassword from './pages/PasswordReset/ResetPassword'
import ProfilePage from './pages/ProfilePage/ProfilePage'
import AppointmentsPage from './pages/AppointmentsPage/AppointmentsPage'
import AddRemove from './pages/AddRemove/AddRemove'
import Sidebar from "./components/Sidebar/Sidebar";
import SchedulePage from './pages/SchedulePage/SchedulePage';
import Schedule from './components/Schedule/Schedule'; // for testing purposes. it should be removed in production.
import AddAppointment from './pages/AddAppointment/AddAppointment'

function Logout() {
  localStorage.clear();
  return <Navigate to="/login" />;
}

function logoutAndRegister() {
  localStorage.clear();
  return <Register />;
}

function App() {
  return (
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/appointments-page" element={<AppointmentsPage />} />
          <Route path="/profile-page" element={<ProfilePage />} />
          <Route path="/schedule-page" element={<SchedulePage />} />
          <Route path="/about" element={<About />} />
          <Route path="/singleservice" element={<Services />} />
          <Route path="/contact" element={<Contactus />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/logout" element={<Logout />} />
          <Route path="/patients" element={<Patients />} />
          <Route path="/appointment" element={<Appointment />} />
          <Route path="/choose" element={<Choose />} />
          <Route path="/verify-email/:userId" element={<VerifyEmail />} />
          <Route path="/request-password-reset" element={<RequestPasswordReset />} />
          <Route path="/addremove" element={<AddRemove />} />
          <Route path="/password-reset/:uid/:token" element={<ResetPassword />} />
          <Route path="*" element={<NotFound />} />
          <Route path="/add-appointment" element={<AddAppointment />} />
        </Routes>
      </BrowserRouter>
  );
}

export default App;
