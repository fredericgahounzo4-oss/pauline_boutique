from rest_framework.permissions import BasePermission


class IsAdminRole(BasePermission):
    """
    Vérifie que l'utilisateur connecté a le rôle 'admin'.
    Équivalent de la vérification de rôle que le PHP faisait via le token.
    """
    message = "Accès réservé aux administrateurs."

    def has_permission(self, request, view):
        return (
            request.user
            and request.user.is_authenticated
            and request.user.role == 'admin'
        )
