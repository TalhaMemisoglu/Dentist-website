import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import BigCalendar from '../../components/Big-Calendar/Big-Calendar';
import { ACCESS_TOKEN } from "../../constants";
import api from "../../api";

const Schedule = () => {
    const [events, setEvents] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [userType, setUserType] = useState(null);
    const [dentists, setDentists] = useState([]);
    const [selectedDentistId, setSelectedDentistId] = useState(null);
    const navigate = useNavigate();

    // First fetch user type
    useEffect(() => {
        const fetchUserInfo = async () => {
            try {
                const token = localStorage.getItem(ACCESS_TOKEN);
                if (!token) {
                    console.warn("No token found. Redirecting to login...");
                    navigate("/login"); // Eğer token yoksa giriş sayfasına yönlendir
                    return;
                }

                const response = await api.get("/api/user/");
                const { user_type } = response.data;
                setUserType(user_type);

                console.log("User in Fetch:", userType);

                if (!["manager", "dentist", "assistant"].includes(user_type)) {
                    console.warn("Unauthorized access. Redirecting...");
                    navigate("/unauthorized");
                    return;
                }
            } catch (error) {
                console.error("Error fetching user data:", error);
                setError("Failed to fetch user info.");
            }
        };

        fetchUserInfo();
    }, [navigate]);

    // Then fetch dentists if user is admin or assistant
    useEffect(() => {
        const fetchDentists = async () => {
            try {
                console.log("Fetching dentists...");  // Debug log
                const response = await api.get('/api/dentists/');  // This endpoint returns all dentists
                console.log("Dentists response:", response.data);  // Debug log
                
                if (response.data && Array.isArray(response.data)) {
                    // You don't need to filter, as the backend is already filtering for 'dentist' user_type
                    console.log("Dentists:", response.data);  // Debug log
                    setDentists(response.data);
                    
                    // Set first dentist as default
                    if (response.data.length > 0) {
                        setSelectedDentistId(response.data[0].id);
                    }
                }
            } catch (error) {
                console.error('Error fetching dentists:', error);
                setError("Failed to load dentists.");
            }
        };
    
        if (userType === 'manager' || userType === 'assistant') {
            fetchDentists();
        }
    }, [userType]);
    
    // Fetch events based on selected dentist or user type
    useEffect(() => {
        console.log("User Type:", userType);
        console.log("Selected Dentist ID:", selectedDentistId);

        if (!userType || !selectedDentistId) return;

        const fetchEvents = async () => {
            try {
                console.log("Fetching events...");
                setIsLoading(true);
                let apiUrl;

                switch (userType) {
                    case "manager":
                        apiUrl = `api/admin/calendar/by-dentist/?dentist_id=${selectedDentistId}`;
                        break;
                    case "assistant":
                        apiUrl = `/api/booking/appointments/by-dentist/?dentist_id=${selectedDentistId}`;
                        break;
                    case "dentist":
                        apiUrl = "/api/booking/appointments/dentist-calendar/";
                        break;
                    default:
                        return;
                }
        
                console.log("Fetching events from:", apiUrl);  // Debug log
                const response = await api.get(apiUrl);
                console.log("API Response:", response.data);  // Debug log
        
                if (response.data && response.data.appointments) {
                    const fetchedEvents = response.data.appointments.map((event) => ({
                        title: `${event.patient_name} - ${event.treatment}`,
                        PatientName: event.patient_name,
                        treatment: event.treatment,
                        start: new Date(event.start),
                        end: new Date(event.end),
                        status: event.status
                    }));
                    setEvents(fetchedEvents);
                } else {
                    console.error("Unexpected response format:", response.data);
                    setError("Unexpected response format.");
                }
            } catch (error) {
                setError("Failed to load events.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchEvents();
    }, [userType, selectedDentistId]);

    if (isLoading) return <p>Loading...</p>;
    if (error) return <p>{error}</p>;

    const showFilter = userType === 'manager' || userType === 'assistant';

    return (
        <div className="schedule-container">
            {showFilter && dentists.length > 0 && (
                <div className="dentist-filter">
                    <select
                        value={selectedDentistId || ''}
                        onChange={(e) => setSelectedDentistId(e.target.value)}
                        className="dentist-select"
                    >
                        {dentists.map((dentist) => (
                            <option key={dentist.id} value={dentist.id}>
                                {dentist.first_name} {dentist.last_name}
                            </option>
                        ))}
                    </select>
                </div>
            )}
            
            <BigCalendar 
                events={events} 
                userType={userType}
                selectedDentistId={selectedDentistId}
            />
        </div>
    );
};

export default Schedule;

