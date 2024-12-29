import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import CircularProgress from "@mui/material/CircularProgress";
import { useNavigate } from "react-router-dom";

import "./AddRemove.scss";
import Sidebar from "../../components/Sidebar/Sidebar";

const AddRemove = () => {
  const navigate = useNavigate();
  const [staff, setStaff] = useState([]);
  const [formData, setFormData] = useState({
    ad: "",
    soyad: "",
    email: "",
    telefon: "",
    userType: "",
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem("access_token");
    if (!token) {
      navigate("/login");
      return;
    }
    fetchStaff();
  }, [navigate]);

  const fetchStaff = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("access_token");
      const response = await axios.get(`${process.env.VITE_API_URL}/api/admin/staff/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setStaff(response.data);
    } catch (error) {
      if (error.response?.status === 401) {
        navigate("/login");
      }
      toast.error(error.response?.data?.error || "Personelleri getirirken bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "telefon") {
      // Sadece 10 hane kabul edilir
      // Only accept numbers and limit to 10 digits
      const cleaned = value.replace(/\D/g, "").slice(0, 10);
      setFormData({ ...formData, [name]: cleaned });
      return;
    }

    setFormData({ ...formData, [name]: value });
    
    if (errors[name]) { // Clear error for this field when user starts typing
      setErrors({ ...errors, [name]: null });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.ad.trim()) newErrors.ad = "Lütfen ad giriniz.";
    if (!formData.soyad.trim()) newErrors.soyad = "Lütfen soyad giriniz.";
    if (!formData.email.trim() || !/\S+@\S+\.\S+/.test(formData.email))
      newErrors.email = "Lütfen geçerli bir e-posta adresi giriniz.";
    if (!formData.telefon.trim() || formData.telefon.length !== 10)
      newErrors.telefon = "Lütfen 10 haneli bir telefon numarası giriniz.";
    if (!formData.userType.trim()) newErrors.userType = "Lütfen bir kullanıcı tipi seçiniz.";
    return newErrors;
  };

  const handleAdd = async () => {
    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      setSubmitLoading(true);
      const token = localStorage.getItem("access_token");
      const formattedData = {
        ...formData,
        telefon: formData.telefon.replace(/\D/g, ""), // Remove any non-digit characters
      };

      await axios.post(
        `${process.env.VITE_API_URL}/api/admin/staff/`,
        formattedData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      toast.success("Personel başarıyla eklendi!");
      setFormData({
        ad: "",
        soyad: "",
        email: "",
        telefon: "",
        user_type: "",
      });
      setErrors({});
      fetchStaff();
    } catch (error) {
      if (error.response?.status === 401) {
        navigate("/login");
      }
      toast.error(error.response?.data?.error || "Personel eklerken bir hata oluştu.");
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleRemove = async (staffId) => {
    if (!window.confirm("Bu personeli silmek istediğinizden emin misiniz?")) {
      return;
    }

    try {
      const token = localStorage.getItem("access_token");
      await axios.delete(
        `${process.env.VITE_API_URL}/api/admin/staff/${staffId}/`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      toast.success("Personel başarıyla silindi!");
      fetchStaff();
    } catch (error) {
      if (error.response?.status === 401) {
        navigate("/login");
      }
      toast.error(error.response?.data?.error || "Personel silinirken bir hata oluştu.");
    }
  };

  return (
    <div className="add-remove-page">
    <Sidebar />
    <div className="add-remove-container">
      <h1>Personel Ekle / Sil</h1>
      <div className="form">
        <div className="form-group">
          <input
            type="text"
            name="ad"
            placeholder="Ad"
            value={formData.ad}
            onChange={handleChange}
            className={errors.ad ? "error-input" : ""}
          />
          {errors.ad && <span className="error">{errors.ad}</span>}
        </div>
        <div className="form-group">
          <input
            type="text"
            name="soyad"
            placeholder="Soyad"
            value={formData.soyad}
            onChange={handleChange}
            className={errors.soyad ? "error-input" : ""}
          />
          {errors.soyad && <span className="error">{errors.soyad}</span>}
        </div>
        <div className="form-group">
          <input
            type="email"
            name="email"
            placeholder="E-posta (örn: ornek@domain.com)"
            value={formData.email}
            onChange={handleChange}
            className={errors.email ? "error-input" : ""}
          />
          {errors.email && <span className="error">{errors.email}</span>}
        </div>
        <div className="form-group">
          <input
            type="tel"
            name="telefon"
            placeholder="Telefon (5xx xxx xx xx)"
            value={formData.telefon}
            onChange={handleChange}
            className={errors.telefon ? "error-input" : ""}
          />
          {errors.telefon && <span className="error">{errors.telefon}</span>}
        </div>
        <div className="form-group">
          <select
            name="userType"
            value={formData.userType}
            onChange={handleChange}
            className={errors.userType ? "error-input" : ""}
          >
            <option value="">Kullanıcı Tipi Seçiniz</option>
            <option value="assistant">Asistan</option>
            <option value="dentist">Diş Hekimi</option>
            <option value="manager">Yönetici</option>
          </select>
          {errors.userType && <span className="error">{errors.userType}</span>}
        </div>
        <button 
          onClick={handleAdd} 
          disabled={submitLoading}
          className="add-button"
        >
          {submitLoading ? (
            <CircularProgress size={24} color="inherit" />
          ) : (
            "Ekle"
          )}
        </button>
      </div>
      <div className="staff-list">
        {loading ? (
          <div className="loading-container">
            <CircularProgress />
            <p>Personel listesi yükleniyor...</p>
          </div>
        ) : staff.length === 0 ? (
          <div className="no-staff">
            <p>Henüz personel bulunmamaktadır.</p>
          </div>
        ) : (
          staff.map((member) => (
            <div className="staff-item" key={member.id}>
              <div className="details">
                <p>
                  <strong>Ad Soyad:</strong> {member.ad} {member.soyad}
                </p>
                <p>
                  <strong>E-posta:</strong> {member.email}
                </p>
                <p>
                  <strong>Telefon:</strong> {member.telefon}
                </p>
                <p>
                  <strong>Kullanıcı Tipi:</strong>{" "}
                  {member.userType === "dentist"
                    ? "Diş Hekimi"
                    : member.userType === "assistant"
                    ? "Asistan"
                    : "Yönetici"}
                </p>
              </div>
              <button
                onClick={() => handleRemove(member.id)}
                className="remove-button"
              >
                Sil
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  </div>
);
};

export default AddRemove;
