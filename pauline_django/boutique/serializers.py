from rest_framework import serializers
from django.contrib.auth import get_user_model

User = get_user_model()


class RegisterSerializer(serializers.Serializer):
    nom = serializers.CharField()
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True, min_length=8)

    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("Email déjà utilisé")
        return value

    def create(self, validated_data):
        return User.objects.create_user(
            email=validated_data['email'],
            nom=validated_data['nom'],
            password=validated_data['password'],
        )


class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)

    def validate(self, data):
        try:
            user = User.objects.get(email=data['email'].lower())
        except User.DoesNotExist:
            raise serializers.ValidationError("Email ou mot de passe incorrect")

        if not user.check_password(data['password']):
            raise serializers.ValidationError("Email ou mot de passe incorrect")

        if not user.actif:
            raise serializers.ValidationError("Compte désactivé")

        data['user'] = user
        return data