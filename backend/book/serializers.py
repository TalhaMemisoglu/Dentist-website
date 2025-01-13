from django.forms import ValidationError
from rest_framework import serializers
from .models import Appointment
from api.models import CustomUser
from datetime import datetime, timedelta

class DentistSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ['id', 'first_name', 'last_name', 'email', 'phone']

class AppointmentSerializer(serializers.ModelSerializer):
    patient_name = serializers.CharField(source='patient.get_full_name', read_only=True)
    dentist_name = serializers.CharField(source='dentist.get_full_name', read_only=True)

    class Meta:
        model = Appointment
        fields = [
            'id', 'patient', 'patient_name', 'dentist', 'dentist_name',
            'appointment_date', 'appointment_time', 'duration', 
            'status', 'notes', 'created_at','treatment'
        ]
        read_only_fields = ['id','patient_name','created_at']

    def validate(self, data):
        print("\n=== Serializer validate method ===")
        
        try:
            appointment = Appointment(**data)
            print("Created appointment instance for validation")
            appointment.clean()
            print("Appointment validation passed")
            return data
        except ValidationError as e:
            print(f"Validation error: {str(e)}")
            raise serializers.ValidationError(str(e))


class AdminCalendarAppointmentSerializer(serializers.ModelSerializer):
    title = serializers.SerializerMethodField()
    start = serializers.SerializerMethodField()
    end = serializers.SerializerMethodField()
    className = serializers.SerializerMethodField()
    patient_name = serializers.SerializerMethodField()
    dentist_name = serializers.SerializerMethodField()

    class Meta:
        model = Appointment
        fields = ['id', 'title', 'start', 'end', 'className', 
                 'patient_name', 'dentist_name', 'status', 'notes','treatment']

    def get_title(self, obj):
        return f"{obj.patient.get_full_name()} - Dt. {obj.dentist.get_full_name()} {obj.treatment}"

    def get_start(self, obj):
        return datetime.combine(obj.appointment_date, obj.appointment_time).isoformat()

    def get_end(self, obj):
        start = datetime.combine(obj.appointment_date, obj.appointment_time)
        return (start + timedelta(minutes=obj.duration)).isoformat()

    def get_className(self, obj):
        return f'status-{obj.status}'

    def get_patient_name(self, obj):
        return obj.patient.get_full_name()

    def get_dentist_name(self, obj):
        return obj.dentist.get_full_name()