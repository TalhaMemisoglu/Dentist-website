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
from .serializers import CustomUserSerializer, ProfileSerializer, LoginSerializer, UserSerializer


# Email Verification View
class VerifyEmailView(generics.GenericAPIView):
    permission_classes = [AllowAny]

    def get(self, request, user_id):
        try:
            print(f"GET request for user_id={user_id}")
            user = get_object_or_404(CustomUser, id=user_id)
            print(f"User before update: {user.email}, Verified={user.verified}")

            if user.verified:
                return Response({"message": "Email is already verified!"}, status=status.HTTP_200_OK)

            user.verified = True
            user.save()
            print(f"User after update: {user.email}, Verified={user.verified}")

            return Response({"message": "Email verified successfully!"}, status=status.HTTP_200_OK)
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
        subject = "Verify Your Email Address"
        message = f"Click the link to verify your email: {verification_link}"

        try:
            send_mail(subject, message, settings.DEFAULT_FROM_EMAIL, [user.email])
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        success_message = f'Account created for {user.username}! Please verify your email.'
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
                    return Response({"error": "Please verify your email before logging in."}, status=status.HTTP_400_BAD_REQUEST)

                refresh = RefreshToken.for_user(user)

                return Response({
                    "access": str(refresh.access_token),
                    "refresh": str(refresh),
                    "user_type": user.user_type,
                })
            else:
                print(f"Authentication failed for {email}.")

            return Response({"error": "Invalid credentials"}, status=status.HTTP_400_BAD_REQUEST)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# Logout View
class LogoutView(generics.GenericAPIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            refresh_token = request.data.get("refresh_token")
            token = RefreshToken(refresh_token)
            token.blacklist()
            return Response({"message": "Successfully logged out."}, status=200)
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
            return Response({"error": "Profile not found."}, status=404)

# Dentist List View
class DentistListView(generics.GenericAPIView):
    permission_classes = [AllowAny]

    def get(self, request):
        dentists = CustomUser.objects.filter(user_type='dentist')
        serializer = CustomUserSerializer(dentists, many=True)
        return Response(serializer.data)

# Current User View
class CurrentUserView(generics.GenericAPIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        print(f"Received token: {request.headers.get('Authorization')}")
        user = request.user

        if not user.is_authenticated:
            print("User is not authenticated.")
            return Response({"error": "Unauthorized"}, status=status.HTTP_401_UNAUTHORIZED)

        print(f"Authenticated user: {user.email}")

        serializer = UserSerializer(user)
        return Response(serializer.data)

# Password Reset Request View
class PasswordResetRequestView(generics.GenericAPIView):
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get("email")
        if not email:
            return Response({"error": "Email is required."}, status=status.HTTP_400_BAD_REQUEST)

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

        subject = "Password Reset Request"
        message = f"Click the link to reset your password: {reset_url}"

        send_mail(subject, message, settings.DEFAULT_FROM_EMAIL, [user.email])

        return Response({"message": "Password reset email sent successfully!"}, status=status.HTTP_200_OK)

# Password Reset View
class PasswordResetView(generics.GenericAPIView):
    permission_classes = [AllowAny]

    def post(self, request, uid, token):
        new_password = request.data.get("new_password")
        if not new_password:
            return Response({"error": "New password is required."}, status=status.HTTP_400_BAD_REQUEST)

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
                return Response({"error": "Invalid or expired token."}, status=status.HTTP_400_BAD_REQUEST)

            user.set_password(new_password)
            user.save()

            return Response({"message": "Password reset successfully!"}, status=status.HTTP_200_OK)
        except Exception as e:
            # Debug: Log the exception
            print("Error during password reset:", str(e))
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)