from django.db import models
from django.contrib.auth.models import User,AbstractUser
from django.core.exceptions import ValidationError



class CustomUser(AbstractUser):             #For custom user model which we will need for dentist patient and etc.
    USER_TYPES = (
        ('dentist', 'Dentist'),
        ('patient', 'Patient'),
        ('assistant','Assistant'),             
        ('manager','Manager'), 
    )

    # # get_full_name added
    # def get_full_name(self):
    #     return f"{self.first_name} {self.last_name}"
    
    user_type = models.CharField(max_length=10, choices=USER_TYPES, default='patient')
    phone = models.CharField(max_length=200, null=True, blank=True)  # Optional phone field
    email = models.EmailField(max_length=254,unique=True)  #required email field
    verified = models.BooleanField(default=False)  # Added verified field
    
    # Fix reverse accessor clashes
    groups = models.ManyToManyField(
        'auth.Group',
        related_name='custom_user_set',
        blank=True,
        help_text='The groups this user belongs to. A user will get all permissions granted to each of their groups.',
        verbose_name='groups',
    )
    user_permissions = models.ManyToManyField(
        'auth.Permission',
        related_name='custom_user_set',
        blank=True,
        help_text='Specific permissions for this user.',
        verbose_name='user permissions',
    )
    
    def save(self, *args, **kwargs):
        # Only automatically set verified if it's a new object (i.e., on creation)
        if not self.pk:  # Object is being created
            if self.user_type == 'patient':
                self.verified = False  # Patients are not verified by default
            else:
                self.verified = True  # All other types are automatically verified
        super().save(*args, **kwargs)  # Call the parent class's save method

        

class Profile(models.Model):
    user = models.OneToOneField(CustomUser, on_delete=models.CASCADE)
    first_name = models.CharField(max_length=200, null=True, blank=True)
    last_name = models.CharField(max_length=200, null=True, blank=True)
    email = models.EmailField(null=True, blank=True)
    phone = models.CharField(max_length=15, null=True, blank=True)  # Unique if needed

    def __str__(self):             
        return f"{self.first_name} {self.last_name}" if self.first_name and self.last_name else self.user.username
    
    def save(self, *args, **kwargs):    
        super().save(*args, **kwargs)