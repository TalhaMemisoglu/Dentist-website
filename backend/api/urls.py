from django.urls import path, include
from .views import CreateUserView, ProfileView, LoginView, LogoutView, DentistListView,CurrentUserView,VerifyEmailView,UpdatePasswordView,UpdateUserProfileView
from .views import PasswordResetRequestView, PasswordResetView   
from .views import StaffManagementView, StaffDetailView, StaffListView


urlpatterns = [
    path('register/', CreateUserView.as_view(), name='register'),
    path('profile/', ProfileView.as_view(), name='profile'),
    path('profile/update/', UpdateUserProfileView.as_view(), name='update-profile'),
    path('profile/change-password/', UpdatePasswordView.as_view(), name='change-password'),
    path('login/', LoginView.as_view(), name='login'),
    path('logout/', LogoutView.as_view(), name='logout'),
    path('user/', CurrentUserView.as_view(), name='current-user'),
    path('dentists/', DentistListView.as_view(), name='dentist-list'),
    path('verify-email/<int:user_id>/', VerifyEmailView.as_view(), name='verify-email'),
    path('password-reset-request/', PasswordResetRequestView.as_view(), name='password_reset_request'),
    path('password-reset/<str:uid>/<str:token>/', PasswordResetView.as_view(), name='password_reset'),
    path('staff/list/', StaffListView.as_view(), name='staff-list'),
    path('admin/staff/', StaffManagementView.as_view(), name='admin-list'),
    path('admin/staff/<int:user_id>/', StaffDetailView.as_view(), name='staff-detail'),
]
