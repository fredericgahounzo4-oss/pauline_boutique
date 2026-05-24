import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { apiUrl } from '../utils/api';

export const Register = () => {
    const navigate = useNavigate();
    const [form, setForm] = useState({ nom: '', email: '', password: '', confirm: '' });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const getStrength = (pwd) => {
        if (!pwd) return 0;
        let s = 0;
        if (pwd.length >= 8) s++;
        if (/[A-Z]/.test(pwd)) s++;
        if (/[0-9]/.test(pwd)) s++;
        if (/[^A-Za-z0-9]/.test(pwd)) s++;
        return s;
    };
    const strength = getStrength(form.password);
    const strengthLabel = ['', 'Faible', 'Moyen', 'Bon', 'Fort'][strength];
    const strengthColor = ['', 'bg-red-400', 'bg-orange-400', 'bg-yellow-400', 'bg-green-500'][strength];

    const validate = () => {
        const e = {};
        if (!form.nom.trim()) e.nom = 'Le nom est requis.';
        if (!form.email) e.email = "L'e-mail est requis.";
        else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'E-mail invalide.';
        if (!form.password) e.password = 'Le mot de passe est requis.';
        else if (form.password.length < 8) e.password = 'Minimum 8 caractères.';
        if (!form.confirm) e.confirm = 'Veuillez confirmer.';
        else if (form.password !== form.confirm) e.confirm = 'Les mots de passe ne correspondent pas.';
        return e;
    };

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
        setErrors({ ...errors, [e.target.name]: '', general: '' });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const errs = validate();
        if (Object.keys(errs).length > 0) { setErrors(errs); return; }
        setIsLoading(true);
        setErrors({});
        try {
            const res = await fetch(apiUrl('/api/auth/register'), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ nom: form.nom, email: form.email, password: form.password })
            });
            const data = await res.json();
            if (!res.ok) {
                setErrors({ general: data.error || "Erreur lors de la création du compte." });
            } else {
                localStorage.setItem('pauline_user', JSON.stringify(data.user));
                setSuccess(true);
                setTimeout(() => navigate('/'), 1500);
            }
        } catch (err) {
            setErrors({ general: "Erreur réseau. Vérifiez que le serveur est bien lancé." });
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
                <h2 className="text-center text-3xl font-serif font-bold text-text">Créer un compte</h2>
                <p className="mt-2 text-center text-sm text-text-muted">Rejoignez-nous et profitez d'une expérience shopping personnalisée</p>
            </div>
            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-surface py-8 px-4 shadow-xl sm:rounded-lg sm:px-10 border border-gray-100">
                    {success && (
                        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md text-green-700 text-sm text-center">
                            ✅ Compte créé ! Redirection...
                        </div>
                    )}
                    {errors.general && (
                        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm text-center">
                            ❌ {errors.general}
                        </div>
                    )}
                    <form className="space-y-5" onSubmit={handleSubmit}>
                        <div>
                            <label className="block text-sm font-medium text-text">Nom complet</label>
                            <input name="nom" value={form.nom} onChange={handleChange}
                                placeholder="Votre nom complet" className={inputClass('nom')} />
                            {errors.nom && <p className="mt-1 text-xs text-red-500">{errors.nom}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-text">Adresse e-mail</label>
                            <input name="email" type="email" value={form.email} onChange={handleChange}
                                placeholder="exemple@email.com" className={inputClass('email')} />
                            {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-text">Mot de passe</label>
                            <div className="relative">
                                <input name="password" type={showPassword ? 'text' : 'password'}
                                    value={form.password} onChange={handleChange}
                                    placeholder="Minimum 8 caractères" className={inputClass('password')} />
                                <button type="button" onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600">
                                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                            {form.password && (
                                <div className="mt-2 space-y-1">
                                    <div className="flex gap-1">
                                        {[1,2,3,4].map(i => (
                                            <div key={i} className={`h-1 flex-1 rounded-full ${i <= strength ? strengthColor : 'bg-gray-200'}`} />
                                        ))}
                                    </div>
                                    <p className="text-xs text-gray-500">Force : <span className="font-medium">{strengthLabel}</span></p>
                                </div>
                            )}
                            {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-text">Confirmer le mot de passe</label>
                            <div className="relative">
                                <input name="confirm" type={showConfirm ? 'text' : 'password'}
                                    value={form.confirm} onChange={handleChange}
                                    placeholder="Répétez le mot de passe" className={inputClass('confirm')} />
                                <button type="button" onClick={() => setShowConfirm(!showConfirm)}
                                    className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600">
                                    {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                            {form.confirm && form.password === form.confirm && (
                                <p className="mt-1 text-xs text-green-600">✓ Les mots de passe correspondent</p>
                            )}
                            {errors.confirm && <p className="mt-1 text-xs text-red-500">{errors.confirm}</p>}
                        </div>
                        <Button className="w-full flex justify-center py-3" disabled={isLoading || success}>
                            {isLoading ? 'Création en cours...' : 'Créer mon compte'}
                        </Button>
                    </form>
                </div>
                <p className="mt-8 text-center text-sm text-text-muted">
                    Déjà un compte ?{' '}
                    <Link to="/login" className="font-medium text-primary hover:underline">Se connecter</Link>
                </p>
            </div>
        </div>
    );
};
