import React, { useState, useEffect } from "react";
import Sidebar from "../../components/Sidebar/Sidebar";
import CalendarView from "../../components/Calendar/Calendar";
import api from "../../api";
import "./AddAppointment.scss";

const AddAppointment = () => {
    const [name, setName] = useState("");
    const [surname, setSurname] = useState("");
    const [phone, setPhone] = useState("");
    const [email, setEmail] = useState("");
    const [selectedService, setSelectedService] = useState(null);
    const [selectedDentist, setSelectedDentist] = useState(null);
    const [selectedDate, setSelectedDate] = useState(null);
    const [availableDates, setAvailableDates] = useState([]);
    const [services, setServices] = useState([]);
    const [dentists, setDentists] = useState([]);
    const [availableHours, setAvailableHours] = useState([]);
    const [selectedTime, setSelectedTime] = useState(null);
    const [patients, setPatients] = useState([]);
    const [selectedPatient, setSelectedPatient] = useState(null);
    const [filteredPatients, setFilteredPatients] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");

    const fetchPatients = async () => {
        try {
            const res = await api.get("/api/assistant/appointments/patient-list/");
            console.log("patients: ", res.data.patients);

            setPatients(res.data.patients);
            setFilteredPatients(res.data.patients);
        } catch (err) {
            console.error("Error fetching patients:", err);
        }
    };

    const handlePatientSearch = (e) => {
        const query = e.target.value.toLowerCase();
        setSearchQuery(query);

        const filtered = patients.filter((patient) =>
                (patient.first_name?.toLowerCase() + " " + patient.last_name?.toLowerCase()).includes(query) ||
                patient.email?.toLowerCase().includes(query)
        );
        setFilteredPatients(filtered);
        console.log("patients: ", patients);
    };

    useEffect(() => {
        fetchPatients();
    }, []);

    const handlePatientChange = (e) => {
        const patientId = e.target.value;
        const patient = patients.find((p) => p.id === patientId);
        setSelectedPatient(patient);
        if (patient) {
            setName(patient.first_name);
            setSurname(patient.last_name);
            setPhone(patient.phone);
            setEmail(patient.email);
        }
    };

    const handleDentistChange = (e) => {
        const selectedDentistId = e.target.value;
        const dentist = dentists.find((dentist) => dentist.id === selectedDentistId);
        setSelectedDentist(dentist);
        setSelectedDate(null); // Reset the selected date when dentist changes
        // setAvailableDates([]); // Clear the available dates
        // setAvailableHours([]); // Clear the available hours
    };

    // Handle time selection
    const handleTimeSelection = (time) => {
        setSelectedTime(time);
    };

    // Handle the date selection from the calendar
    const handleDateSelection = (date) => {
        setSelectedDate(date);
    };

    useEffect(() => {
        // Fetch services
        setServices([
            { id: '1', name: 'DİŞ PROTEZİ', duration: '60 dk' },
            { id: '2', name: 'İMPLANT', duration: '60 dk' },
            { id: '3', name: 'DİŞ BEYAZLATMA', duration: '60 dk' },
            { id: '4', name: 'ORTADONTİ', duration: '60 dk' },
            { id: '5', name: 'AĞIZ İÇİ BAKIM', duration: '60 dk' },
            { id: '6', name: 'DİŞ TEMİZLİĞİ', duration: '60 dk' },
            { id: '7', name: 'KANAL TEDAVİ', duration: '60 dk' },
        ]);

        // Fetch dentists
        const fetchDentists = async () => {
            try {
                const res = await api.get("/api/dentists/");
                setDentists(res.data);

                if (res.data.length > 0) {
                    setSelectedDentist(res.data[0])
                }
            } catch (err) {
                // alert("Error fetching dentists: " + err.message);
            }
        };

        fetchDentists();
    }, []);

    useEffect(() => {
        const fetchAvailableDates = async (dentistId) => {
            try {
                const res = await api.get(`/api/booking/dentists/${dentistId}/available_dates/`);
                // console.log("dates: ", res);
                setAvailableDates(res.data.available_dates);
            } catch (err) {
                // alert("Error fetching available dates: " + err.message);
            }
        };

        if (selectedDentist) {
            fetchAvailableDates(selectedDentist.id);
        }
    }, [selectedDentist]);

    useEffect(() => {
        const fetchAvailableHours = async () => {
            if (!selectedDentist || !selectedDate) return;

            try {
                const response = await api.get(
                    `/api/booking/dentists/${selectedDentist.id}/available_slots/`,
                    { params: { date: selectedDate } }
                );
                setAvailableHours(response.data.available_slots);
            } catch (err) {
                console.error('Error fetching hours:', err);
                alert(err.response?.data?.detail || 'Failed to fetch hours');
            }
        };

        if (selectedDate) {
            fetchAvailableHours();
        }
    }, [selectedDentist, selectedDate]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        // if (!selectedDentist || !selectedDate || !selectedService) {
        //     alert('Please select all required fields');
        //     return;
        // }
        
        const appointmentData = {
            patient_id: 11,
            dentist_id: 32,
            appointment_date: "2025-01-14",
            start_time: "09:00",
            treatment: "IMPLANT",
        };

        try {
            console.log("post data: ", appointmentData);
            const response = await api.post('/api/assistant/appointments/', appointmentData);

            if (response.status === 201) {
                alert('Appointment created successfully!');
                // Optionally navigate to another page or reset the form
            }
        } catch (err) {
            console.error('Booking error:', err.response?.data || err.message || err);
            alert(err.response?.data?.detail || 'Failed to create appointment');
        }
    };

    return (
        <div className="add-appointment-page-container">
            <div className="sidebar-wrapper">
                <Sidebar />
            </div>
            <div className="add-appointment-wrapper">
                <h2>Add New Appointment</h2>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="patient-search">Search Patient</label>
                        <div className="search-container">
                            <div className="search-input-wrapper">
                                <input
                                    type="text"
                                    id="patient-search"
                                    value={searchQuery}
                                    onChange={handlePatientSearch}
                                    placeholder="Search by name or email"
                                    className="responsive-field"
                                />
                                {searchQuery && (
                                    <button
                                        type="button"
                                        className="clear-button"
                                        onClick={() => {
                                            setSearchQuery(""); // Clear the search query
                                            setFilteredPatients(patients); // Reset the filtered list
                                        }}
                                    >
                                        ✖
                                    </button>
                                )}
                            </div>
                            {searchQuery && filteredPatients.length > 0 && (
                                <ul className="search-results">
                                    {filteredPatients.map((patient) => (
                                        <li
                                            key={patient.id}
                                            onClick={() => {
                                                setSelectedPatient(patient);
                                                setSearchQuery(
                                                    `${patient.first_name || ""} ${patient.last_name || ""}`.trim() || patient.email
                                                );
                                                setFilteredPatients([]); // close the dropdown
                                            }}
                                        >
                                            {patient.first_name} {patient.last_name} - {patient.email}
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    </div>
                    <div className="form-group">
                        <label htmlFor="service">Treatment</label>
                        <select id="service" value={selectedService?.id || ""} onChange={(e) => setSelectedService(services.find(service => service.id === e.target.value))}>
                            <option value="" disabled>Select a treatment</option>
                            {services.map(service => (
                                <option key={service.id} value={service.id}>{service.name}</option>
                            ))}
                        </select>
                    </div>
                    <div className="form-group">
                        <label htmlFor="dentist">Doctor</label>
                        <select 
                            id="dentist"
                            value={selectedDentist?.id || ""}
                            onChange={handleDentistChange}
                        >
                            <option value="" disabled>Select a doctor</option>
                            {dentists.map(dentist => (
                                <option key={dentist.id} value={dentist.id}>
                                    {dentist.first_name} {dentist.last_name}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="calendar-hours-container row">
                        <div className="calendar-section col">
                            <CalendarView
                                onDateChange={handleDateSelection}
                                selectedDate={selectedDate}
                                availableDates={availableDates}
                            />
                        </div>

                        <div className="hours-section col">
                            {availableHours.length > 0 ? (
                                <div className='available-hours row'>
                                    <ul>
                                        {availableHours.map((slot, index) => (
                                            <li key={index} className='selected-time'>
                                                <button
                                                    onClick={() => handleTimeSelection(slot)}
                                                    className={selectedTime === slot ? 'selected-time' : ''}
                                                >
                                                    {slot.start_time}
                                                </button>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            ) : (
                                <div className='no-hour'>
                                    <p>Seçilen tarihte uygun saat bulunamadı.</p>
                                </div>
                            )}
                        </div>
                    </div>
                    <button className="submit-button" type="submit">Add Appointment</button>
                </form>
            </div>
        </div>
    );
};

export default AddAppointment;
