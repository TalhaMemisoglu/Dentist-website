import React, { useState, useEffect } from 'react';
import api from "../../api";
import './Choose.scss'; 
import 'bootstrap/dist/css/bootstrap.min.css';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar/Navbar';
import Footer from '../../sections/Footer/Footer';

const Choose = () => {
  const navigate = useNavigate();
  const [showAllServices, setShowAllServices] = useState(false);
  // needs to be replaced
  const [dentists, setDentists] = useState([]);
  const [selectedService, setSelectedService] = useState(null);
  const [selectedDentist, setSelectedDentist] = useState(null);

  useEffect(() => {
    const fetchDentists = async () => {
      api
        .get("/api/dentists/")
        .then((res) => res.data)
        .then((data) => {
          setDentists(data);
          console.log(data);
        })
        .catch((err) => alert(err));
    };

    fetchDentists();
  }, []);

  // Handle the selection of service and dentist
  const handleServiceClick = (service) => {
    setSelectedService(service);
  };

  const handleDentistClick = (dentist) => {
    setSelectedDentist(dentist);
  };

  const handleSubmit = () => {
    if (!selectedService || !selectedDentist) {
      alert('Lütfen hem hizmet hem de doktor seçin.');
      return;
    }
    navigate(`/appointment`, {
      state: { service: selectedService, dentist: selectedDentist },
    });
  };

  // Static list of services
  const services = [
    { id: '1', name: 'DİŞ PROTEZİ', duration: '60 dk' },
    { id: '2', name: 'İMPLANT', duration: '60 dk' },
    { id: '3', name: 'DİŞ BEYAZLATMA', duration: '60 dk' },
    { id: '4', name: 'ORTADONTİ', duration: '60 dk' },
    { id: '5', name: 'AĞIZ İÇİ BAKIM', duration: '60 dk' },
    { id: '6', name: 'DİŞ TEMİZLİĞİ', duration: '60 dk' },
    { id: '7', name: 'KANAL TEDAVİ', duration: '60 dk' },
  ];

  return (
    <>
      <Navbar />
      <div className='choose-body'>
        <div className="container">
          <h1>Ne yaptırmak istersiniz?</h1>
          <div className="services-grid">
            {services.map((service) => (
              <div
                className={`service-box ${selectedService === service ? 'selected' : ''}`}
                onClick={() => handleServiceClick(service)}
                key={service.id}
                style={{
                  borderColor: service.id === selectedService?.id ? 'blue' : 'gray',
                }}
              >
                <h2>{service.name}</h2>
                <div className="line-between"></div>
                <p className="duration">Süre: {service.duration}</p>
                <span className="arrow">→</span>
              </div>
            ))}
          </div>
        </div>

        <div className="container">
          <h1>Doktorunuzu Seçiniz.</h1>
          {dentists.length > 0 ? (
            <div className="services-grid">
              {dentists.map((dentist) => (
                <div
                  className={`service-box ${selectedDentist === dentist ? 'selected' : ''}`}
                  onClick={() => handleDentistClick(dentist)} 
                  key={dentist.id}
                  style={{
                    borderColor: dentist.id === selectedDentist?.id ? 'blue' : 'gray',
                  }}
                >
                  <h2>{dentist.first_name} {dentist.last_name}</h2>
                  <div className="line-between"></div>
                  <p className="specialty">{dentist.specialty}</p>
                  <span className="arrow">→</span>
                </div>
              ))}
            </div>
          ) : (
            <p>Doktor bilgileri yükleniyor...</p>
          )}
        </div>

        <div className="container">
          <button
            className="btn btn-primary"
            onClick={handleSubmit}
          >
            Devam Et
          </button>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Choose;
