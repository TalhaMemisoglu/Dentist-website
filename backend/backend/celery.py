from __future__ import absolute_import, unicode_literals
import os
from celery import Celery
from celery.schedules import crontab
from django.utils.timezone import timedelta

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')

app = Celery('backend')

app.config_from_object('django.conf:settings', namespace='CELERY')

app.autodiscover_tasks()

app.conf.update(
    worker_pool='solo',
)

app.conf.beat_schedule = {
    'send-appointment-reminders': {
        'task': 'booking.tasks.send_appointment_reminders',
        'schedule': timedelta(minutes=30),
    },
    'cancel-past-appointments': {
        'task': 'booking.tasks.auto_cancel_past_appointments',
        'schedule': crontab(hour=0, minute=0),  # Run at midnight
        'options': {
            'expires': 3600,  # Task expires after 1 hour
        }
    },
}
