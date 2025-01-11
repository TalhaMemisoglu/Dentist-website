from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework import generics, status
from django.contrib.auth import authenticate
from django.shortcuts import get_object_or_404
from django.core.mail import send_mail
from django.conf import settings
from rest_framework_simplejwt.tokens import RefreshToken
from django.db import transaction
from django.contrib.auth.tokens import PasswordResetTokenGenerator  # For generating secure tokens for password reset
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode  # Encoding/decoding user IDs for URLs
from django.utils.encoding import force_bytes, force_str  # Converting between bytes and string representations
from .models import CustomUser, Profile
from .serializers import CustomUserSerializer,DentistListSerializer, ProfileSerializer, LoginSerializer, UserSerializer, UserProfileUpdateSerializer, PasswordUpdateSerializer
from rest_framework.generics import UpdateAPIView, ListAPIView
from rest_framework.views import APIView
import logging

logger = logging.getLogger(__name__)


from rest_framework.permissions import IsAdminUser
from .serializers import StaffManagementSerializer, StaffListSerializer

from rest_framework.authentication import TokenAuthentication

# Email Verification View
class VerifyEmailView(generics.GenericAPIView):
    permission_classes = [AllowAny]

    def get(self, request, user_id):
        try:
            print(f"GET request for user_id={user_id}")
            user = get_object_or_404(CustomUser, id=user_id)
            print(f"User before update: {user.email}, Verified={user.verified}")

            if user.verified:
                return Response({"message": "E-posta zaten doğrulanmış!"}, status=status.HTTP_200_OK)

            user.verified = True
            user.save()
            print(f"User after update: {user.email}, Verified={user.verified}")

            return Response({"message": "E-posta başarıyla doğrulandı!"}, status=status.HTTP_200_OK)
        except Exception as e:
            print(f"Error: {e}")
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# User Registration View with Email Verification
class CreateUserView(generics.CreateAPIView):
    queryset = CustomUser.objects.all()
    serializer_class = CustomUserSerializer
    permission_classes = [AllowAny]

    def create(self, request, *args, **kwargs):
        response = super().create(request, *args, **kwargs)
        user_data = response.data
        user = CustomUser.objects.get(email=user_data['email'])

        user.verified = False
        user.save()

        refresh = RefreshToken.for_user(user)
        access_token = str(refresh.access_token)

        verification_link = f"{settings.FRONTEND_URL}/verify-email/{user.id}"
        subject = "E-posta Adresinizi Doğrulayın"
        message = f"E-postanızı doğrulamak için bu bağlantıya tıklayın: {verification_link}"

        try:
            send_mail(subject, message, settings.DEFAULT_FROM_EMAIL, [user.email])
        except Exception as e:
            return Response({"error": f"E-posta gönderimi sırasında bir hata oluştu: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        success_message = f'{user.username} için hesap oluşturuldu! Lütfen e-postanızı doğrulayın.'
        return Response({
            'message': success_message,
            'user': user_data,
            'access_token': access_token,
            'refresh_token': str(refresh),
        }, status=status.HTTP_201_CREATED)

# Custom Token Obtain Pair View for Email Authentication
class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = LoginSerializer  # Use the LoginSerializer to authenticate by email and password

# Login View with Email and Password Authentication
class LoginView(generics.GenericAPIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        if serializer.is_valid():
            email = serializer.validated_data['email']
            password = serializer.validated_data['password']

            print("Attempting to authenticate user:", email)

            user = authenticate(request, username=email, password=password)

            if user:
                print(f"User {email} authenticated successfully.")
                if not user.verified:
                    return Response({"error": "Lütfen giriş yapmadan önce e-postanızı doğrulayın."}, status=status.HTTP_400_BAD_REQUEST)

                refresh = RefreshToken.for_user(user)

                return Response({
                    "access": str(refresh.access_token),
                    "refresh": str(refresh),
                    "user_type": user.user_type,
                })
            else:
                print(f"Authentication failed for {email}.")

            return Response({"error": "Geçersiz kimlik bilgileri"}, status=status.HTTP_400_BAD_REQUEST)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# Logout View
class LogoutView(generics.GenericAPIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            refresh_token = request.data.get("refresh_token")
            token = RefreshToken(refresh_token)
            token.blacklist()
            return Response({"message": "Başarıyla çıkış yapıldı."}, status=200)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

# Profile Management Views
class ProfileView(generics.GenericAPIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        try:
            profile = Profile.objects.get(user=request.user)
            serializer = ProfileSerializer(profile)
            return Response(serializer.data)
        except Profile.DoesNotExist:
            return Response({"error": "Profil bulunamadı."}, status=404)

# Dentist List View
class DentistListView(ListAPIView):
    serializer_class = DentistListSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        return CustomUser.objects.filter(user_type='dentist')

# Current User View
class CurrentUserView(generics.GenericAPIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        print(f"Received token: {request.headers.get('Authorization')}")
        user = request.user

        if not user.is_authenticated:
            print("User is not authenticated.")
            return Response({"error": "Yetkisiz"}, status=status.HTTP_401_UNAUTHORIZED)

        print(f"Authenticated user: {user.email}")

        serializer = UserSerializer(user)
        return Response(serializer.data)

# Password Reset Request View
class PasswordResetRequestView(generics.GenericAPIView):
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get("email")
        if not email:
            return Response({"error": "E-posta gereklidir."}, status=status.HTTP_400_BAD_REQUEST)

        user = get_object_or_404(CustomUser, email=email)

        # Debug: Check the user
        print("User found:", user)

        token_generator = PasswordResetTokenGenerator()
        token = token_generator.make_token(user)
        uid = urlsafe_base64_encode(force_bytes(user.id))

        # Debug: Log the generated token and uid
        print("Generated Token:", token)
        print("Generated UID:", uid)

        reset_url = f"{settings.FRONTEND_URL}/password-reset/{uid}/{token}/"
        
        # Debug: Log the reset URL
        print("Reset URL:", reset_url)

        subject = "Şifre sıfırlama talebi"
        message = f"Şifreni sıfırlamak için bu bağlantıya tıkla: {reset_url}"

        send_mail(subject, message, settings.DEFAULT_FROM_EMAIL, [user.email])

        return Response({"message": "Şifre sıfırlama e-postası başarıyla gönderildi!"}, status=status.HTTP_200_OK)

# Password Reset View
class PasswordResetView(generics.GenericAPIView):
    permission_classes = [AllowAny]

    def post(self, request, uid, token):
        new_password = request.data.get("new_password")
        if not new_password:
            return Response({"error": "Yeni bir şifre gerekli."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            user_id = force_str(urlsafe_base64_decode(uid))
            # Debug: Log the decoded user ID
            print("Decoded UID:", user_id)

            user = get_object_or_404(CustomUser, id=user_id)

            token_generator = PasswordResetTokenGenerator()

            # Debug: Check if token is valid
            token_is_valid = token_generator.check_token(user, token)
            print("Token check result:", token_is_valid)

            if not token_is_valid:
                return Response({"error": "Geçersiz veya süresi dolmuş bir token."}, status=status.HTTP_400_BAD_REQUEST)

            user.set_password(new_password)
            user.save()

            return Response({"message": "Şifre başarıyla sıfırlandı!"}, status=status.HTTP_200_OK)
        except Exception as e:
            # Debug: Log the exception
            print("Error during password reset:", str(e))
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
        
        
class UpdateUserProfileView(UpdateAPIView):
    queryset = CustomUser.objects.all()  # Define the model queryset
    serializer_class = UserProfileUpdateSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        # Override to fetch the current logged-in user
        return self.request.user



class UpdatePasswordView(APIView):
    permission_classes = [IsAuthenticated]

    def put(self, request, *args, **kwargs):
        logger.debug(f"Received password update request for user: {request.user.username}")
        serializer = PasswordUpdateSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            logger.debug("Password update serializer validated successfully.")
            serializer.update(request.user, serializer.validated_data)
            logger.info("Password updated successfully for user.")
            return Response({"message": "Şifre başarıyla güncellendi."}, status=status.HTTP_200_OK)
        logger.error(f"Password update serializer validation failed: {serializer.errors}")
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


'''
    API endpoints

    List all staff
    GET /api/admin/staff/ --> html
    GET /api/staff/list/ --> json

    Add new staff member
    POST /api/admin/staff/
    {
        "email": "dentist@example.com",
        "first_name": "John",
        "last_name": "Doe",
        "phone": "05339999999",
        "user_type": "dentist"
    }

    Get specific staff member
    GET /api/admin/staff/1/

    Update staff member
    PUT /api/admin/staff/1/
    {
        "phone": "05339999999",
        "email": "newemail@example.com"
    }

    Remove staff member
    DELETE /api/admin/staff/1/
'''


class StaffListView(APIView):
    permission_classes = [IsAuthenticated] #CHANGE
    
    def get(self, request):
        staff = CustomUser.objects.filter(
            user_type__in=['dentist', 'assistant', 'manager']
        ).order_by('user_type', 'first_name')
        
        serializer = StaffListSerializer(staff, many=True)
        return Response({
            'count': len(serializer.data),
            'results': serializer.data
        }, status=status.HTTP_200_OK)


class StaffManagementView(APIView):
    permission_classes = [IsAdminUser]

    # List all staff members
    def get(self, request):
        staff = CustomUser.objects.filter(
            user_type__in=['dentist', 'assistant', 'manager']
        ).order_by('user_type', 'username')
        serializer = StaffManagementSerializer(staff, many=True)
        return Response(serializer.data)
    
    # Add new staff member
    def post(self, request):
        serializer = StaffManagementSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class StaffDetailView(APIView):
    permission_classes = [IsAdminUser]

    def get_staff_member(self, user_id):
        try:
            return CustomUser.objects.get(
                id=user_id,
                user_type__in=['dentist', 'assistant', 'manager']
            )
        except CustomUser.DoesNotExist:
            return None
    
    # Get specific staff member details
    def get(self, request, user_id):
        staff = self.get_staff_member(user_id)
        if not staff:
            return Response(
                {"error": "Staff member not found"},
                status=status.HTTP_404_NOT_FOUND
            )
        serializer = StaffManagementSerializer(staff)
        return Response(serializer.data)

    # Update staff member details
    def put(self, request, user_id):
        staff = self.get_staff_member(user_id)
        if not staff:
            return Response(
                {"error": "Staff member not found"},
                status=status.HTTP_404_NOT_FOUND
            )
        serializer = StaffManagementSerializer(staff, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    # Remove staff member
    def delete(self, request, user_id):
        staff = self.get_staff_member(user_id)
        if not staff:
            return Response(
                {"error": "Staff member not found"},
                status=status.HTTP_404_NOT_FOUND
            )
        staff.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
