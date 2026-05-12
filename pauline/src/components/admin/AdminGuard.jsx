import { Navigate } from 'react-router-dom';

// Composant qui protège les pages admin
// Si l'utilisateur n'est pas connecté ou n'est pas admin → redirige vers /login
export const AdminGuard = ({ children }) => {
    const user = JSON.parse(localStorage.getItem('pauline_user') || 'null');

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    if (user.role !== 'admin') {
        return <Navigate to="/" replace />;
    }

    return children;
};
