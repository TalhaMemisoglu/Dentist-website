# serializers.py
from rest_framework import serializers
from django.contrib.auth import get_user_model
from book.models import Appointment
from .models import Profile,CustomUser
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_bytes, force_str
from django.contrib.auth.tokens import PasswordResetTokenGenerator
from django.contrib.auth.hashers import check_password
import logging

logger = logging.getLogger(__name__)


import random
import string

from django.core.mail import send_mail
from django.conf import settings


class CustomUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ['id','first_name', 'last_name', 'email','phone', 'password']
        extra_kwargs = {
            'password': {'write_only': True}
        }

    def create(self, validated_data):
        first_name = validated_data.pop('first_name')
        last_name = validated_data.pop('last_name')

        # Create the user without username first
        user = CustomUser.objects.create(
            first_name=first_name,
            last_name=last_name,
            **validated_data
        )
        
        # Generate a username after user creation using the id field
        username = f"{first_name.lower()}{last_name.lower()}{user.id}"

        # Update the user's username with the generated value
        user.username = username
        user.set_password(validated_data['password'])
        user.save()

        return user
    
# Login Serializer    
class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField()

    def validate(self, data):
        email = data.get('email')
        password = data.get('password')

        if not email or not password:
            raise serializers.ValidationError("Email ve şifre gerekli.")

        return data

class AppointmentSerializer(serializers.ModelSerializer):
    patient_name = serializers.CharField(source='patient.get_full_name', read_only=True)
    dentist_name = serializers.CharField(source='dentist.get_full_name', read_only=True)

    class Meta:
        model = Appointment
        fields = [
            'id', 'patient_name', 'dentist_name', 'appointment_date', 
            'appointment_time', 'duration', 'status', 'notes'
        ]

class ProfileSerializer(serializers.ModelSerializer):
    appointments = AppointmentSerializer(many=True, read_only=True)

    class Meta:
        model = Profile
        fields = [
            'id', 'first_name','last_name', 'email', 'phone', 'appointments'
        ]
        
        
class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ['id', 'first_name', 'last_name' ,'phone', 'email', 'user_type']
        

class PasswordResetSerializer(serializers.Serializer):
    new_password = serializers.CharField(write_only=True)

    def validate_new_password(self, value):
        try:
            validate_password(value)
        except ValidationError as e:
            raise serializers.ValidationError(str(e))
        return value

    def save(self, uid, token):
        try:
            user_id = force_str(urlsafe_base64_decode(uid))
            user = get_user_model().objects.get(id=user_id)
        except (TypeError, ValueError, get_user_model().DoesNotExist):
            raise serializers.ValidationError("Geçersiz veya süresi dolmuş bir token.")

        token_generator = PasswordResetTokenGenerator()
        if not token_generator.check_token(user, token):
            raise serializers.ValidationError("Geçersiz veya süresi dolmuş bir token.")

        user.set_password(self.validated_data['new_password'])
        user.save()
        return user
    

class PasswordResetRequestSerializer(serializers.Serializer):
    email = serializers.EmailField()

    def validate_email(self, value):
        try:
            user = get_user_model().objects.get(email=value)
        except get_user_model().DoesNotExist:
            raise serializers.ValidationError("Bu e-posta ile kayıtlı bir kullanıcı bulunamadı.")
        return value
   

        

class UserProfileUpdateSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(read_only=True)  # Prevent email updates
                                                    #Should make a warning if email tries to be updated
    class Meta:
        model = CustomUser
        fields = ['first_name', 'last_name', 'email', 'phone']  # Include fields you want to allow updates for
        


class PasswordUpdateSerializer(serializers.Serializer):
    currentPassword = serializers.CharField(write_only=True)
    newPassword = serializers.CharField(write_only=True)

    def validate_current_password(self, value):
        user = self.context['request'].user
        logger.debug(f"Validating current password for user: {user.username}")
        if not check_password(value, user.password):
            logger.error("Current password validation failed.")
            raise serializers.ValidationError("Current password is incorrect.")
        logger.debug("Current password validated successfully.")
        return value

    def validate_new_password(self, value):
        logger.debug("Validating new password with Django validators.")
        try:
            validate_password(value)  # Use Django's password validators
        except Exception as e:
            logger.error(f"New password validation failed: {e}")
            raise
        logger.debug("New password validated successfully.")
        return value

    def update(self, instance, validated_data):
        logger.debug(f"Updating password for user: {instance.username}")
        instance.set_password(validated_data['newPassword'])
        instance.save()
        logger.debug("Password updated and saved successfully.")
        return instance



class StaffManagementSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'phone', 'user_type']
        read_only_fields = ['username']  # Username will be auto-generated

    def validate(self, data):
        logger.debug(f"Validating data: {data}")
        required_fields = ['email', 'first_name', 'last_name', 'user_type']
        missing_fields = [field for field in required_fields if field not in data]
        
        if missing_fields:
            raise serializers.ValidationError(
                f"Missing required fields: {', '.join(missing_fields)}"
            )
        
        return data
    
    
    def validate_user_type(self, value):
        valid_staff_types = ['dentist', 'assistant', 'manager']
        if value not in valid_staff_types:
            raise serializers.ValidationError(f"User type must be one of: {', '.join(valid_staff_types)}")
        return value

    def create(self, validated_data):
        try:
            # Generate username from first and last name
            first_name = validated_data.get('first_name', '').lower()
            last_name = validated_data.get('last_name', '').lower()
            base_username = f"{first_name}{last_name}"
            username = base_username
            counter = 1
            
            # Keep trying until we find a unique username
            while CustomUser.objects.filter(username=username).exists():
                username = f"{base_username}{counter}"
                counter += 1

            # Generate random password
            temp_password = ''.join(random.choices(string.ascii_letters + string.digits, k=12))

            # Prepare user data
            user_data = {
                'username': username,  # Include username in the main data
                'first_name': validated_data.get('first_name', ''),
                'last_name': validated_data.get('last_name', ''),
                'email': validated_data.get('email', ''),
                'phone': validated_data.get('phone', ''),
                'user_type': validated_data.get('user_type', '')
            }

            # Create the user
            user = CustomUser.objects.create_user(
                password=temp_password,
                **user_data
            )

            # Send email with credentials
            try:
                send_mail(
                    "Your Account Credentials",
                    f"""
                    Hesabınız Oluşturulmuştur:
                    Kullanıcı Adı: {username}
                    Geçici Şifre: {temp_password}
                    
                    İlk girişiniz sonrası şifrenizi değiştiriniz.
                    """,
                    settings.DEFAULT_FROM_EMAIL,
                    [user.email],
                    fail_silently=False,
                )
            except Exception as e:
                logger.error(f"Failed to send email: {e}")
                # Continue even if email fails, but log the error

            return user
            
        except Exception as e:
            logger.error(f"Error creating user: {e}")
            raise serializers.ValidationError(f"Error creating user: {str(e)}")


class StaffListSerializer(serializers.ModelSerializer):
    full_name = serializers.SerializerMethodField()
    
    class Meta:
        model = CustomUser
        fields = ['id', 'email', 'full_name', 'phone', 'user_type']
        
    def get_full_name(self, obj):
        return f"{obj.first_name} {obj.last_name}".strip()