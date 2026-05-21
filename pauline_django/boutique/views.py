from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken

from .models import Utilisateur, Produit, Categorie, Commande, CommandeItem
from .serializers import RegisterSerializer, LoginSerializer


def get_tokens(user):
    refresh = RefreshToken.for_user(user)
    return {
        "token": str(refresh.access_token),
        "refresh": str(refresh)
    }


def user_to_dict(user):
    return {
        "id": user.id,
        "nom": user.nom,
        "email": user.email,
        "role": user.role,
    }


class RegisterView(APIView):
    def post(self, request):
        serializer = RegisterSerializer(data=request.data)

        if not serializer.is_valid():
            return Response(
                {"error": " ".join([str(e[0]) for e in serializer.errors.values()])},
                status=400
            )

        user = serializer.save()
        tokens = get_tokens(user)

        return Response({
            "success": True,
            "user": user_to_dict(user),
            **tokens
        }, status=201)


class LoginView(APIView):
    def post(self, request):
        serializer = LoginSerializer(data=request.data)

        if not serializer.is_valid():
            return Response(
                {"error": " ".join([str(e[0]) for e in serializer.errors.values()])},
                status=401
            )

        user = serializer.validated_data["user"]
        tokens = get_tokens(user)

        return Response({
            "success": True,
            "user": user_to_dict(user),
            "token": tokens["token"],
            "refresh": tokens["refresh"]
        })