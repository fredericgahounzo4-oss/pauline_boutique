import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { ArrowLeft, Eye, EyeOff } from 'lucide-react';

export const Register = () => {
    const navigate = useNavigate();
    const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const validate = () => {
        const errs = {};
        if (!form.name.trim()) errs.name = "Le nom est requis.";
        if (!form.email) errs.email = "L'e-mail est requis.";
        else if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = "E-mail invalide.";
        if (!form.password) errs.password = "Le mot de passe est requis.";
        else if (form.password.length < 8) errs.password = "Minimum 8 caractères.";
        if (!form.confirm) errs.confirm = "Veuillez confirmer votre mot de passe.";
        else if (form.password !== form.confirm) errs.confirm = "Les mots de passe ne correspondent pas.";
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
            const res = await fetch('/api/auth/register.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    nom:      form.name,
                    email:    form.email,
                    password: form.password
                })
            });

            const data = await res.json();

            if (!res.ok) {
                setErrors({ general: data.error || "Une erreur est survenue." });
            } else {
                setSuccess(true);
                // Rediriger vers login après 2 secondes
                setTimeout(() => navigate('/login'), 2000);
            }
        } catch (err) {
            setErrors({ general: "Erreur réseau. Vérifiez que XAMPP (Apache + MySQL) est bien lancé." });
        } finally {
            setIsLoading(false);
        }
    };

    const inputClass = (field) =>
        `appearance-none block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm bg-background-alt ${errors[field] ? 'border-red-400' : 'border-gray-200'}`;

    // Indicateur force du mot de passe
    const getPasswordStrength = () => {
        const p = form.password;
        if (!p) return null;
        if (p.length < 6) return { label: 'Faible', color: 'bg-red-400', width: 'w-1/4' };
        if (p.length < 8) return { label: 'Moyen', color: 'bg-yellow-400', width: 'w-2/4' };
        if (/[A-Z]/.test(p) && /[0-9]/.test(p)) return { label: 'Fort', color: 'bg-green-500', width: 'w-full' };
        return { label: 'Bon', color: 'bg-blue-400', width: 'w-3/4' };
    };
    const strength = getPasswordStrength();

    return (
        <div className="min-h-screen bg-background flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <Link to="/" className="flex justify-center items-center gap-2 text-text-muted hover:text-primary mb-8 transition-colors">
                    <ArrowLeft size={16} /> Retour à la boutique
                </Link>
                <h2 className="text-center text-3xl font-serif font-bold text-text">
                    Créer un compte
                </h2>
                <p className="mt-2 text-center text-sm text-text-muted">
                    Rejoignez-nous et profitez d'une expérience shopping personnalisée
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-surface py-8 px-4 shadow-xl sm:rounded-lg sm:px-10 border border-gray-100">

                    {/* Message succès */}
                    {success && (
                        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md text-green-700 text-sm text-center">
                            ✅ Compte créé avec succès ! Redirection vers la connexion...
                        </div>
                    )}

                    {/* Erreur générale (ex: email déjà utilisé, XAMPP éteint) */}
                    {errors.general && (
                        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm text-center">
                            ❌ {errors.general}
                        </div>
                    )}

                    <form className="space-y-5" onSubmit={handleSubmit}>
                        {/* Nom */}
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-text">Nom complet</label>
                            <div className="mt-1">
                                <input id="name" name="name" type="text" value={form.name} onChange={handleChange}
                                    placeholder="Jean Dupont" className={inputClass('name')} />
                                {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name}</p>}
                            </div>
                        </div>

                        {/* Email */}
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-text">Adresse e-mail</label>
                            <div className="mt-1">
                                <input id="email" name="email" type="email" autoComplete="email" value={form.email}
                                    onChange={handleChange} placeholder="exemple@email.com" className={inputClass('email')} />
                                {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email}</p>}
                            </div>
                        </div>

                        {/* Mot de passe */}
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-text">Mot de passe</label>
                            <div className="mt-1 relative">
                                <input id="password" name="password" type={showPassword ? 'text' : 'password'}
                                    value={form.password} onChange={handleChange}
                                    placeholder="Minimum 8 caractères" className={inputClass('password')} />
                                <button type="button" onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600">
                                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                                {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password}</p>}
                            </div>
                            {/* Barre de force */}
                            {strength && (
                                <div className="mt-2">
                                    <div className="w-full bg-gray-200 rounded-full h-1.5">
                                        <div className={`h-1.5 rounded-full transition-all ${strength.color} ${strength.width}`} />
                                    </div>
                                    <p className="text-xs text-text-muted mt-1">Force : {strength.label}</p>
                                </div>
                            )}
                        </div>

                        {/* Confirmer */}
                        <div>
                            <label htmlFor="confirm" className="block text-sm font-medium text-text">Confirmer le mot de passe</label>
                            <div className="mt-1 relative">
                                <input id="confirm" name="confirm" type={showConfirm ? 'text' : 'password'}
                                    value={form.confirm} onChange={handleChange}
                                    placeholder="Répétez votre mot de passe" className={inputClass('confirm')} />
                                <button type="button" onClick={() => setShowConfirm(!showConfirm)}
                                    className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600">
                                    {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                                {errors.confirm && <p className="mt-1 text-xs text-red-500">{errors.confirm}</p>}
                            </div>
                        </div>

                        <div>
                            <Button className="w-full flex justify-center py-3" disabled={isLoading || success}>
                                {isLoading ? 'Création en cours...' : 'Créer mon compte'}
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
                    Vous avez déjà un compte ?{' '}
                    <Link to="/login" className="font-medium text-primary hover:underline">
                        Connectez-vous ici
                    </Link>
                </p>
            </div>
        </div>
    );
};
