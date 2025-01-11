from django.contrib import admin
from django.urls import include, path
from rest_framework_simplejwt.views import TokenRefreshView,TokenVerifyView
from book.views import DentistViewSet, AppointmentViewSet, AdminCalendarViewSet, AssistantAppointmentViewSet
from api.views import CreateUserView, ProfileView, LoginView, LogoutView, DentistListView,CurrentUserView,CustomTokenObtainPairView,VerifyEmailView

# Define views explicitly
dentist_list = DentistViewSet.as_view({'get': 'list'})
dentist_detail = DentistViewSet.as_view({'get': 'retrieve'})
available_dates = DentistViewSet.as_view({'get': 'available_dates'})
available_slots = DentistViewSet.as_view({'get': 'available_slots'})

appointment_list = AppointmentViewSet.as_view({'get': 'list', 'post': 'create'})
appointment_detail = AppointmentViewSet.as_view({'get': 'retrieve'})
cancel_appointment = AppointmentViewSet.as_view({'post': 'cancel', 'delete': 'cancel'})
complete_appointment = AppointmentViewSet.as_view({'post': 'complete'})
upcoming_appointments = AppointmentViewSet.as_view({'get': 'upcoming'})
my_appointments = AppointmentViewSet.as_view({'get': 'my_appointments'})
update_past_appointments = AppointmentViewSet.as_view({'get': 'update_past_appointments'})
auto_cancel = AppointmentViewSet.as_view({'get': 'auto_cancel_past_appointments'})


calendar_appointments = AppointmentViewSet.as_view({'get': 'calendar_appointments'})
appointments_by_date = AppointmentViewSet.as_view({'get': 'appointments_by_date'})
appointments_stats = AppointmentViewSet.as_view({'get': 'appointments_stats'})
calendar_by_dentist = AppointmentViewSet.as_view({'get': 'appointments_by_dentist'})


dentist_calendar = AppointmentViewSet.as_view({'get': 'dentist_calendar'})
dentist_appointments_by_date = AppointmentViewSet.as_view({'get': 'dentist_appointments_by_date'})
dentist_daily_schedule = AppointmentViewSet.as_view({'get': 'dentist_daily_schedule'})


admin_calendar_all = AdminCalendarViewSet.as_view({'get': 'all_appointments'})
admin_calendar_by_dentist = AdminCalendarViewSet.as_view({'get': 'appointments_by_dentist'})
admin_calendar_by_date = AdminCalendarViewSet.as_view({'get': 'appointments_by_date'})
admin_calendar_stats = AdminCalendarViewSet.as_view({'get': 'stats'})


assistant_appointment_list = AssistantAppointmentViewSet.as_view({
    'get': 'list',
    'post': 'create'
})

assistant_appointment_detail = AssistantAppointmentViewSet.as_view({
    'get': 'retrieve',
    'put': 'update',
    'patch': 'partial_update',
    'delete': 'destroy'
})

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('api.urls')),  # Include all URLs from the `api` app
    path('api/dentists/', DentistListView.as_view(), name='open-dentist-list'),
    # JWT token routes
    path('api/token/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/token/verify/', TokenVerifyView.as_view(), name='token_verify'),
    path('api/booking/dentists/', dentist_list, name='dentist-list'),
    path('api/booking/dentists/<int:pk>/', dentist_detail, name='dentist-detail'),
    path('api/booking/dentists/<int:pk>/available_dates/', available_dates, name='available-dates'),
    path('api/booking/dentists/<int:pk>/available_slots/', available_slots, name='available-slots'),

    # Appointment endpoints
    path('api/booking/appointments/', appointment_list, name='appointment-list'),
    path('api/booking/appointments/<int:pk>/', appointment_detail, name='appointment-detail'),
    path('api/booking/appointments/<int:pk>/cancel/', cancel_appointment, name='cancel-appointment'),
    path('api/booking/appointments/<int:pk>/complete/', complete_appointment, name='complete-appointment'),
    path('api/booking/appointments/upcoming/', upcoming_appointments, name='upcoming-appointments'),
    path('api/booking/appointments/my-appointments/', my_appointments, name='my-appointments'),
    path('api/booking/appointments/update-past/', update_past_appointments, name='update-past-appointments'),
    path('api/booking/appointments/auto-cancel/', auto_cancel, name='auto-cancel-appointments'),

    # Assistant calendar
    path('api/booking/appointments/calendar/', calendar_appointments, name='calendar-appointments'),
    path('api/booking/appointments/by-date/', appointments_by_date, name='appointments-by-date'),
    path('api/booking/appointments/stats/', appointments_stats, name='appointments-stats'),
    path('api/booking/appointments/by-dentist/', calendar_by_dentist, name='calendar_by_dentist'),

    # Admin calendar 
    path('api/admin/calendar/', admin_calendar_all, name='admin-calendar'),
    path('api/admin/calendar/by-dentist/', admin_calendar_by_dentist, name='admin-calendar-by-dentist'),
    path('api/admin/calendar/by-date/', admin_calendar_by_date, name='admin-calendar-by-date'),
    path('api/admin/calendar/stats/', admin_calendar_stats, name='admin-calendar-stats'),

    # Dentist calendar 
    path('api/booking/appointments/dentist-calendar/', dentist_calendar, name='dentist-calendar'),
    path('api/booking/appointments/dentist-by-date/', dentist_appointments_by_date, name='dentist-appointments-by-date'),
    path('api/booking/appointments/dentist-schedule/', dentist_daily_schedule, name='dentist-daily-schedule'),

    path('api/assistant/appointments/',assistant_appointment_list,name='assistant-appointment-list'),
    path('api/assistant/appointments/<int:pk>/',assistant_appointment_detail,name='assistant-appointment-detail'),
    path('api/assistant/appointments/<int:pk>/update/',AssistantAppointmentViewSet.as_view({'patch': 'update_appointment'}),name='assistant-appointment-update'),
    path('api/assistant/appointments/<int:pk>/confirm/',AssistantAppointmentViewSet.as_view({'post': 'confirm_appointment'}),name='assistant-appointment-confirm'),
    path('api/assistant/appointments/<int:pk>/cancel/',AssistantAppointmentViewSet.as_view({'post': 'cancel_appointment'}),name='assistant-appointment-cancel'),
]
