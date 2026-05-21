import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { ArrowLeft, Eye, EyeOff } from 'lucide-react';

export const Login = () => {
    const navigate = useNavigate();

    const [form, setForm] = useState({ email: '', password: '' });
    const [showPassword, setShowPassword] = useState(false);
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    // ✅ SAFE API URL (fallback si env manque)
    const API_URL = import.meta.env.VITE_API_URL || "https://hub-shop.onrender.com";

    const validate = () => {
        const errs = {};
        if (!form.email) errs.email = "L'e-mail est requis.";
        else if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = "E-mail invalide.";
        if (!form.password) errs.password = "Le mot de passe est requis.";
        return errs;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const errs = validate();
        if (Object.keys(errs).length > 0) {
            setErrors(errs);
            return;
        }

        setIsLoading(true);
        setErrors({});

        try {
            const res = await fetch(`${API_URL}/api/auth/login/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: form.email,
                    password: form.password
                })
            });

            const data = await res.json();

            if (!res.ok) {
                setErrors({ general: data.error || "Identifiants incorrects." });
                return;
            }

            localStorage.setItem('pauline_user', JSON.stringify(data.user));
            localStorage.setItem('pauline_token', data.token);

            setSuccess(true);

            setTimeout(() => {
                navigate(data.user.role === 'admin' ? '/admin' : '/');
            }, 1000);

        } catch (err) {
            setErrors({
                general: "Erreur réseau / CORS / backend non accessible."
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background flex flex-col justify-center py-12 sm:px-6 lg:px-8">

            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <Link to="/" className="flex justify-center items-center gap-2 text-text-muted hover:text-primary mb-8">
                    <ArrowLeft size={16} /> Retour à la boutique
                </Link>

                <h2 className="text-center text-3xl font-serif font-bold text-text">
                    Bon retour parmi nous
                </h2>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-surface py-8 px-4 shadow-xl sm:rounded-lg sm:px-10">

                    {errors.general && (
                        <div className="mb-4 p-3 bg-red-50 text-red-700 text-sm text-center rounded-md">
                            {errors.general}
                        </div>
                    )}

                    <form className="space-y-6" onSubmit={handleSubmit}>

                        <input
                            name="email"
                            type="email"
                            value={form.email}
                            onChange={(e) => setForm({ ...form, email: e.target.value })}
                            placeholder="Email"
                            className="w-full p-2 border rounded"
                        />

                        <div className="relative">
                            <input
                                name="password"
                                type={showPassword ? 'text' : 'password'}
                                value={form.password}
                                onChange={(e) => setForm({ ...form, password: e.target.value })}
                                placeholder="Mot de passe"
                                className="w-full p-2 border rounded"
                            />

                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-2 text-gray-500"
                            >
                                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                        </div>

                        <Button className="w-full py-3" disabled={isLoading}>
                            {isLoading ? 'Connexion...' : 'Se connecter'}
                        </Button>

                        <div className="text-center text-sm text-text-muted">
                            Pas encore de compte ?{' '}
                            <Link to="/register" className="text-primary">
                                Créer un compte
                            </Link>
                        </div>

                    </form>
                </div>
            </div>
        </div>
    );
};