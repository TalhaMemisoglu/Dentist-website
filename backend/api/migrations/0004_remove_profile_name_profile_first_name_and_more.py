# Generated by Django 5.1.1 on 2024-12-11 17:12

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0003_customuser_verified'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='profile',
            name='name',
        ),
        migrations.AddField(
            model_name='profile',
            name='first_name',
            field=models.CharField(blank=True, max_length=200, null=True),
        ),
        migrations.AddField(
            model_name='profile',
            name='last_name',
            field=models.CharField(blank=True, max_length=200, null=True),
        ),
    ]
