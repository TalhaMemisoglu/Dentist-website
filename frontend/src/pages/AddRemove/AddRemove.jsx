import React, { useState } from "react";
import "./AddRemove.scss";
import Sidebar from "../../components/Sidebar/Sidebar";

const AddRemove = () => {
  const [dentists, setDentists] = useState([]);
  const [formData, setFormData] = useState({
    ad: "",
    soyad: "",
    email: "",
    telefon: "",
    userType: "",
  });
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "telefon") {
      // Sadece 10 hane kabul edilir
      if (value.length > 10) return;
    }

    setFormData({ ...formData, [name]: value });
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

  const handleAdd = () => {
    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
    } else {
      setDentists([...dentists, formData]);
      setFormData({
        ad: "",
        soyad: "",
        email: "",
        telefon: "",
        userType: "",
      });
      setErrors({});
    }
  };

  const handleRemove = (index) => {
    setDentists(dentists.filter((_, i) => i !== index));
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
            />
            {errors.telefon && <span className="error">{errors.telefon}</span>}
          </div>
          <div className="form-group">
            <select
              name="userType"
              value={formData.userType}
              onChange={handleChange}
            >
              <option value="">Kullanıcı Tipi Seçiniz</option>
              <option value="Asistan">Asistan</option>
              <option value="Diş Hekimi">Diş Hekimi</option>
            </select>
            {errors.userType && <span className="error">{errors.userType}</span>}
          </div>
          <button onClick={handleAdd}>Ekle</button>
        </div>
        <div className="dentist-list">
          {dentists.map((dentist, index) => (
            <div className="dentist-item" key={index}>
              <div className="details">
                <p>
                  <strong>Ad Soyad:</strong> {dentist.ad} {dentist.soyad}
                </p>
                <p>
                  <strong>E-posta:</strong> {dentist.email}
                </p>
                <p>
                  <strong>Telefon:</strong> {dentist.telefon}
                </p>
                <p>
                  <strong>Kullanıcı Tipi:</strong> {dentist.userType}
                </p>
              </div>
              <button onClick={() => handleRemove(index)}>Sil</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AddRemove;
