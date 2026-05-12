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

    // ─── Envoi vers PHP ───────────────────────────────────────────────────────
    const handleSubmit = async (e) => {
        e.preventDefault();
        const errs = validate();
        if (Object.keys(errs).length > 0) { setErrors(errs); return; }

        setIsLoading(true);
        setErrors({});

        try {
            const res = await fetch('/api/auth/login.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email:    form.email,
                    password: form.password
                })
            });

            const data = await res.json();

            if (!res.ok) {
                setErrors({ general: data.error || "Identifiants incorrects." });
            } else {
                // ─── Sauvegarder l'utilisateur et le token ─────────────────
                localStorage.setItem('pauline_user',  JSON.stringify(data.user));
                localStorage.setItem('pauline_token', data.token);

                setSuccess(true);
                // Rediriger vers l'accueil après 1.5 secondes
                setTimeout(() => {
    if (data.user.role === 'admin') {
        navigate('/admin');
    } else {
        navigate('/');
    }
}, 1500);
            }
        } catch (err) {
            setErrors({ general: "Erreur réseau. Vérifiez que XAMPP (Apache + MySQL) est bien lancé." });
        } finally {
            setIsLoading(false);
        }
    };

    const inputClass = (field) =>
        `appearance-none block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm bg-background-alt ${errors[field] ? 'border-red-400' : 'border-gray-200'}`;

    return (
        <div className="min-h-screen bg-background flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <Link to="/" className="flex justify-center items-center gap-2 text-text-muted hover:text-primary mb-8 transition-colors">
                    <ArrowLeft size={16} /> Retour à la boutique
                </Link>
                <h2 className="text-center text-3xl font-serif font-bold text-text">
                    Bon retour parmi nous
                </h2>
                <p className="mt-2 text-center text-sm text-text-muted">
                    Connectez-vous pour accéder à votre espace personnalisé
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-surface py-8 px-4 shadow-xl sm:rounded-lg sm:px-10 border border-gray-100">

                    {/* Message succès */}
                    {success && (
                        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md text-green-700 text-sm text-center">
                            ✅ Connexion réussie ! Redirection...
                        </div>
                    )}

                    {/* Erreur générale */}
                    {errors.general && (
                        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm text-center">
                            ❌ {errors.general}
                        </div>
                    )}

                    <form className="space-y-6" onSubmit={handleSubmit}>
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-text">
                                Adresse e-mail
                            </label>
                            <div className="mt-1">
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    autoComplete="email"
                                    value={form.email}
                                    onChange={handleChange}
                                    placeholder="exemple@email.com"
                                    className={inputClass('email')}
                                />
                                {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email}</p>}
                            </div>
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-text">
                                Mot de passe
                            </label>
                            <div className="mt-1 relative">
                                <input
                                    id="password"
                                    name="password"
                                    type={showPassword ? 'text' : 'password'}
                                    autoComplete="current-password"
                                    value={form.password}
                                    onChange={handleChange}
                                    placeholder="Votre mot de passe"
                                    className={inputClass('password')}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                                >
                                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                                {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password}</p>}
                            </div>
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="flex items-center">
                                <input
                                    id="remember-me"
                                    name="remember-me"
                                    type="checkbox"
                                    checked={rememberMe}
                                    onChange={(e) => setRememberMe(e.target.checked)}
                                    className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                                />
                                <label htmlFor="remember-me" className="ml-2 block text-sm text-text-muted">
                                    Se souvenir de moi
                                </label>
                            </div>
                            <div className="text-sm">
                                <a href="#" className="font-medium text-primary hover:text-primary-dark">
                                    Mot de passe oublié ?
                                </a>
                            </div>
                        </div>

                        <div>
                            <Button className="w-full flex justify-center py-3" disabled={isLoading || success}>
                                {isLoading ? 'Connexion en cours...' : 'Se connecter'}
                            </Button>
                        </div>
                    </form>

                    <div className="mt-6">
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-200" />
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-2 bg-surface text-text-muted">Ou</span>
                            </div>
                        </div>
                        <div className="mt-6 grid grid-cols-1 gap-3">
                            <Button variant="outline" className="w-full justify-center">
                                Continuer avec Google
                            </Button>
                        </div>
                    </div>
                </div>

                <p className="mt-8 text-center text-sm text-text-muted">
                    Pas encore de compte ?{' '}
                    <Link to="/register" className="font-medium text-primary hover:underline">
                        Créez-en un ici
                    </Link>
                </p>
            </div>
        </div>
    );
};
