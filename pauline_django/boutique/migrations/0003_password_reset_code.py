from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('boutique', '0002_auto_20260519_2101'),
    ]

    operations = [
        migrations.CreateModel(
            name='PasswordResetCode',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('email', models.EmailField(max_length=254)),
                ('code', models.CharField(max_length=6)),
                ('token', models.CharField(blank=True, max_length=64)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('used', models.BooleanField(default=False)),
            ],
            options={
                'db_table': 'password_reset_codes',
            },
        ),
    ]
