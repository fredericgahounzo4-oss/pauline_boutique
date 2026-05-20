import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { ArrowLeft, Eye, EyeOff } from 'lucide-react';

export const Login = () => {
    const navigate = useNavigate();

    const [form, setForm] = useState({ email: '', password: '' });
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const API_URL = 'http://127.0.0.1:8000'; // ✅ backend Django

    const validate = () => {
        const errs = {};
        if (!form.email) errs.email = "L'e-mail est requis.";
        else if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = "E-mail invalide.";
        if (!form.password) errs.password = "Le mot de passe est requis.";
        return errs;
    };

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
        setErrors({ ...errors, [e.target.name]: '', general: '' });
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
            } else {
                localStorage.setItem('pauline_user', JSON.stringify(data.user));
                localStorage.setItem('pauline_token', data.token);

                setSuccess(true);

                setTimeout(() => {
                    if (data.user.role === 'admin') {
                        navigate('/admin');
                    } else {
                        navigate('/');
                    }
                }, 1200);
            }

        } catch (err) {
            setErrors({
                general: "Erreur réseau. Vérifiez que le backend Django est démarré."
            });
        } finally {
            setIsLoading(false);
        }
    };

    const inputClass = (field) =>
        `appearance-none block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm bg-background-alt ${
            errors[field] ? 'border-red-400' : 'border-gray-200'
        }`;

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

                    {success && (
                        <div className="mb-4 p-3 bg-green-50 text-green-700 text-sm text-center rounded-md">
                            Connexion réussie...
                        </div>
                    )}

                    {errors.general && (
                        <div className="mb-4 p-3 bg-red-50 text-red-700 text-sm text-center rounded-md">
                            {errors.general}
                        </div>
                    )}

                    <form className="space-y-6" onSubmit={handleSubmit}>

                        {/* EMAIL */}
                        <input
                            name="email"
                            type="email"
                            value={form.email}
                            onChange={handleChange}
                            placeholder="Email"
                            className={inputClass('email')}
                        />
                        {errors.email && <p className="text-red-500 text-xs">{errors.email}</p>}

                        {/* PASSWORD */}
                        <div className="relative">
                            <input
                                name="password"
                                type={showPassword ? 'text' : 'password'}
                                value={form.password}
                                onChange={handleChange}
                                placeholder="Mot de passe"
                                className={inputClass('password')}
                            />

                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-2.5 text-gray-400"
                            >
                                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                        </div>

                        {errors.password && (
                            <p className="text-red-500 text-xs">{errors.password}</p>
                        )}

                        {/* MOT DE PASSE OUBLIÉ */}
                        <div className="text-right">
                            <Link
                                to="/forgot-password"
                                className="text-sm text-primary hover:underline"
                            >
                                Mot de passe oublié ?
                            </Link>
                        </div>

                        {/* SUBMIT */}
                        <Button className="w-full py-3" disabled={isLoading || success}>
                            {isLoading ? 'Connexion...' : 'Se connecter'}
                        </Button>

                        {/* INSCRIPTION */}
                        <div className="text-center text-sm text-text-muted">
                            Pas encore de compte ?{' '}
                            <Link
                                to="/register"
                                className="text-primary font-medium hover:underline"
                            >
                                Créer un compte
                            </Link>
                        </div>

                    </form>

                </div>
            </div>
        </div>
    );
};
