import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import CircularProgress from "@mui/material/CircularProgress";
import { useNavigate } from "react-router-dom";
import api from "../../api";
import "./AddRemove.scss";
import Sidebar from "../../components/Sidebar/Sidebar";

const AddRemove = () => {
  const navigate = useNavigate();
  const [staff, setStaff] = useState([]);
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    user_type: "",
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);

  const fetchStaff = async () => {
    try {
      setLoading(true);
      const response = await api.get("/api/admin/staff/");
      setStaff(response.data);
    } catch (error) {
      toast.error("Personelleri getirirken bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "phone") {
      const cleaned = value.replace(/\D/g, "").slice(0, 10);
      setFormData({ ...formData, [name]: cleaned });
      return;
    }

    setFormData({ ...formData, [name]: value });
    
    if (errors[name]) {
      setErrors({ ...errors, [name]: null });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.first_name.trim()) newErrors.first_name = "Lütfen ad giriniz.";
    if (!formData.last_name.trim()) newErrors.last_name = "Lütfen soyad giriniz.";
    if (!formData.email.trim() || !/\S+@\S+\.\S+/.test(formData.email))
      newErrors.email = "Lütfen geçerli bir e-posta adresi giriniz.";
    if (!formData.phone.trim() || formData.phone.length !== 10)
      newErrors.phone = "Lütfen 10 haneli bir telefon numarası giriniz.";
    if (!formData.user_type.trim()) newErrors.user_type = "Lütfen bir kullanıcı tipi seçiniz.";
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
      const formattedData = {
        ...formData,
        phone: formData.phone.replace(/\D/g, ""),
      };

      await api.post("/api/admin/staff/", formattedData);
      toast.success("Personel başarıyla eklendi!");
      setFormData({
        first_name: "",
        last_name: "",
        email: "",
        phone: "",
        user_type: "", 
      });
      setErrors({});
      fetchStaff();
    } catch (error) {
      toast.error("Personel eklerken bir hata oluştu.");
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleRemove = async (staffId) => {
    if (!window.confirm("Bu personeli silmek istediğinizden emin misiniz?")) {
      return;
    }

    try {
      await api.delete(`/api/admin/staff/${staffId}/`);
      toast.success("Personel başarıyla silindi!");
      fetchStaff();
    } catch (error) {
      toast.error("Personel silinirken bir hata oluştu.");
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
              name="first_name"
              placeholder="Ad"
              value={formData.first_name}
              onChange={handleChange}
              className={errors.first_name ? "error-input" : ""}
            />
            {errors.first_name && <span className="error">{errors.first_name}</span>}
          </div>
          <div className="form-group">
            <input
              type="text"
              name="last_name"
              placeholder="Soyad"
              value={formData.last_name}
              onChange={handleChange}
              className={errors.last_name ? "error-input" : ""}
            />
            {errors.last_name && <span className="error">{errors.last_name}</span>}
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
              name="phone"
              placeholder="Telefon (5xx xxx xx xx)"
              value={formData.phone}
              onChange={handleChange}
              className={errors.phone ? "error-input" : ""}
            />
            {errors.phone && <span className="error">{errors.phone}</span>}
          </div>
          <div className="form-group">
            <select
              name="user_type"
              value={formData.user_type}
              onChange={handleChange}
              className={errors.user_type ? "error-input" : ""}
            >
              <option value="">Kullanıcı Tipi Seçiniz</option>
              <option value="assistant">Asistan</option>
              <option value="dentist">Diş Hekimi</option>
              <option value="manager">Yönetici</option>
            </select>
            {errors.user_type && <span className="error">{errors.user_type}</span>}
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
                    <strong>Ad Soyad:</strong> {member.first_name} {member.last_name}
                  </p>
                  <p>
                    <strong>E-posta:</strong> {member.email}
                  </p>
                  <p>
                    <strong>Telefon:</strong> {member.phone}
                  </p>
                  <p>
                    <strong>Kullanıcı Tipi:</strong>{" "}
                    {member.user_type === "dentist"
                      ? "Diş Hekimi"
                      : member.user_type === "assistant"
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