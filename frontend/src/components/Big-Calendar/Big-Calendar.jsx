import 'react-big-calendar/lib/css/react-big-calendar.css';
import React, { useState, useEffect } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment-timezone';
import './Big-Calendar.scss'
import api from '../../api';
import { ACCESS_TOKEN, REFRESH_TOKEN } from "../../constants";

const localizer = momentLocalizer(moment);

const BigCalendar = ({ events, userType, selectedDentistId }) => {
    const [dentists, setDentists] = useState([]);
    const [selectedDentist, setSelectedDentist] = useState('');
    const [appointments, setAppointments] = useState(events || []); // Initialize with passed events

    // Retrieve token once to avoid redundant calls
    const token = localStorage.getItem(ACCESS_TOKEN);

    // Fetch dentists
    useEffect(() => {
        const fetchDentists = async () => {
            if (!token) {
                console.error('Authentication token is missing.');
                return;
            }


            try {
                const response = await api.get('/api/dentists/', {
                    headers: { Authorization: `Bearer ${token}` },
                });
                const dentistsList = response.data; // Backend now returns only dentists
                setDentists(dentistsList);

                // Set first dentist as default when filter is shown
                if (dentistsList.length > 0) {
                    setSelectedDentist(dentistsList[0].id);
                }
            } catch (error) {
                console.error('Error fetching dentists:', error);
            }
        };

    }, [token]);

    // Fetch appointments when dentist is selected
    useEffect(() => {
        const fetchAppointments = async () => {
            if (!selectedDentistId) return;
    
            if (!token) {
                console.error('Authentication token is missing.');
                return;
            }
    
            try {
                let apiUrl;
    
                switch (userType) {
                    case "manager":
                        apiUrl = `/api/admin/calendar/by-dentist/?dentist_id=${selectedDentistId}`;
                        break;
                    case "assistant":
                        apiUrl = `/api/booking/appointments/by-dentist/?dentist_id=${selectedDentistId}`;
                        break;
                    default:
                        console.error('Invalid user type:', userType);
                        return;
                }
    
                console.log("Making request to:", apiUrl);
                console.log("With token:", token ? "Present" : "Missing");
                console.log("User type:", userType);
                console.log("Selected dentist ID:", selectedDentistId);
    
                const response = await api.get(apiUrl, {
                    headers: { 
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                });
    
                // Directly set appointments from response data
                if (response.data) {
                    setAppointments(response.data);
                } else {
                    console.error('Unexpected response format:', response.data);
                    setAppointments([]);
                }
            } catch (error) {
                console.error('Error details:', {
                    message: error.message,
                    status: error.response?.status,
                    statusText: error.response?.statusText,
                    data: error.response?.data,
                    config: {
                        url: error.config?.url,
                        method: error.config?.method,
                        headers: error.config?.headers
                    }
                });
                setAppointments([]);
            }
        };
    
        setAppointments(events);
    }, [selectedDentistId, events, token, userType]);

    const handleDentistChange = (event) => {
        setSelectedDentist(event.target.value);
    };

    const EventComponent = ({ event }) => (
        <div>
            <strong>{event.PatientName}</strong>
            <div>{event.treatment}</div>
        </div>
    );

    // Define custom names for days
    const customDayNames = [
        'Pazar',      // Sunday (0)
        'Pazartesi',  // Monday (1)
        'Salı',       // Tuesday (2)
        'Çarşamba',   // Wednesday (3)
        'Perşembe',   // Thursday (4)
        'Cuma',       // Friday (5)
        'Cumartesi',  // Saturday (6)
    ];

    const customMonthNames = [
        'Ocak',
        'Şubat',
        'Mart',
        'Nisan',
        'Mayıs',
        'Haziran',
        'Temmuz',
        'Ağustos',
        'Eylül',
        'Ekim',
        'Kasım',
        'Aralık',
    ];

    // Haftanın ilk günü Pazartesi olacak
    moment.updateLocale('tr', {
        week: {
            dow: 1, // Pazartesi (0 = Pazar, 1 = Pazartesi)
        },
    });

    // Custom formats for 24-hour time and custom day names
    const formats = {
        timeGutterFormat: (date, culture, localizer) =>
            localizer.format(date, 'HH:mm', culture),
        weekdayFormat: (date) => customDayNames[moment(date).day()], // Week in month_view
        dayFormat: (date) => {
            const dayName = customDayNames[moment(date).day()];
            const dayNumber = moment(date).date();
            return ` ${dayNumber} - ${dayName}`;
        },
        monthHeaderFormat: (date) => customMonthNames[moment(date).month()],
        dayRangeHeaderFormat: ({ start, end }, culture, localizer) => {
            const startDay = moment(start).date();
            const endDay = moment(start).add(4, 'days').date(); // add 4 days for 5 days week
            const startMonth = customMonthNames[moment(start).month()];
            const endMonth = customMonthNames[moment(start).add(4, 'days').month()];
            return startMonth === endMonth
                ? `${startMonth} - ${startDay} - ${endDay}`
                : `${startMonth} ${startDay} - ${endMonth} ${endDay}`;
        },
    };

    // Set the visible time range (9:00 AM to 5:00 PM)
    const minTime = new Date();
    minTime.setHours(9, 0, 0); // 9:00 AM

    const maxTime = new Date();
    maxTime.setHours(17, 0, 0); // 5:00 PM

    // Ensure Monday is the first day of the week
    const weekStartsOn = 1;

    const allowedViews = ['week'];

    return (
        <div className='big-calendar-container'>
            <Calendar
                localizer={localizer}
                events={appointments}
                startAccessor="start"
                endAccessor="end"
                defaultView='week'  // week as the default view
                toolbar={true}     // disable the toolbar
                views={allowedViews}
                formats={formats}   // apply custom formats
                style={{ height: 800 }}
                min={minTime}
                max={maxTime}
                components={{
                    event: EventComponent,
                }}
                firstDay={weekStartsOn}
            />
        </div>
    );
};

export default BigCalendar;
