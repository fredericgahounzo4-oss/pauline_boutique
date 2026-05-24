import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Eye, EyeOff, ArrowLeft } from 'lucide-react';

export const ResetPassword = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const token = searchParams.get('token');

    const [form, setForm]           = useState({ password: '', confirm: '' });
    const [errors, setErrors]       = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [success, setSuccess]     = useState(false);
    const [showPass, setShowPass]   = useState(false);
    const [showConf, setShowConf]   = useState(false);
    const [tokenValid, setTokenValid] = useState(null); // null=checking, true, false

    // Vérifier la validité du token au chargement
    useEffect(() => {
        if (!token) { setTokenValid(false); return; }

        fetch('/api/auth/verify-reset-token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token })
        })
        .then(r => r.json())
        .then(d => setTokenValid(d.valid))
        .catch(() => setTokenValid(false));
    }, [token]);

    const getPasswordStrength = (pwd) => {
        if (!pwd) return null;
        let score = 0;
        if (pwd.length >= 8)  score++;
        if (/[A-Z]/.test(pwd)) score++;
        if (/[0-9]/.test(pwd)) score++;
        if (/[^A-Za-z0-9]/.test(pwd)) score++;
        return score;
    };

    const strength = getPasswordStrength(form.password);
    const strengthLabel = ['Très faible', 'Faible', 'Moyen', 'Fort'][strength - 1] || '';
    const strengthColor = ['bg-red-400', 'bg-orange-400', 'bg-yellow-400', 'bg-green-500'][strength - 1] || '';

    const validate = () => {
        const e = {};
        if (!form.password) e.password = 'Le mot de passe est requis.';
        else if (form.password.length < 8) e.password = 'Minimum 8 caractères.';
        if (!form.confirm) e.confirm = 'Veuillez confirmer le mot de passe.';
        else if (form.password !== form.confirm) e.confirm = 'Les mots de passe ne correspondent pas.';
        return e;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const errs = validate();
        if (Object.keys(errs).length) { setErrors(errs); return; }

        setIsLoading(true);
        setErrors({});

        try {
            const res = await fetch('/api/auth/reset-password-token', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token, new_password: form.password })
            });
            const data = await res.json();

            if (!data.success) {
                setErrors({ general: data.error || 'Erreur lors de la réinitialisation.' });
            } else {
                setSuccess(true);
                setTimeout(() => navigate('/login'), 3000);
            }
        } catch {
            setErrors({ general: 'Erreur réseau. Réessayez.' });
        } finally {
            setIsLoading(false);
        }
    };

    const inputCls = (field) =>
        `appearance-none block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm bg-background-alt ${errors[field] ? 'border-red-400' : 'border-gray-200'}`;

    // ── Token en cours de vérification ──
    if (tokenValid === null) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <p className="text-text-muted text-sm">Vérification du lien...</p>
            </div>
        );
    }

    // ── Token invalide ou expiré ──
    if (!tokenValid) {
        return (
            <div className="min-h-screen bg-background flex flex-col justify-center py-12 sm:px-6 lg:px-8">
                <div className="sm:mx-auto sm:w-full sm:max-w-md">
                    <div className="bg-surface py-8 px-4 shadow-xl sm:rounded-lg sm:px-10 border border-gray-100 text-center space-y-4">
                        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto text-3xl">❌</div>
                        <h2 className="text-xl font-semibold text-text">Lien invalide ou expiré</h2>
                        <p className="text-sm text-text-muted">
                            Ce lien de réinitialisation a expiré ou a déjà été utilisé. Faites une nouvelle demande.
                        </p>
                        <Link to="/forgot-password"
                            className="inline-block bg-primary text-white px-6 py-3 rounded-xl font-semibold text-sm hover:bg-primary/90 transition-colors">
                            Nouvelle demande
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <Link to="/login" className="flex justify-center items-center gap-2 text-text-muted hover:text-primary mb-8 transition-colors">
                    <ArrowLeft size={16} /> Retour à la connexion
                </Link>
                <h2 className="text-center text-3xl font-serif font-bold text-text">
                    Nouveau mot de passe
                </h2>
                <p className="mt-2 text-center text-sm text-text-muted">
                    Choisissez un mot de passe sécurisé
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-surface py-8 px-4 shadow-xl sm:rounded-lg sm:px-10 border border-gray-100">

                    {success ? (
                        <div className="text-center space-y-4">
                            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto text-3xl">✅</div>
                            <h3 className="text-lg font-semibold text-text">Mot de passe modifié !</h3>
                            <p className="text-sm text-text-muted">
                                Votre mot de passe a été réinitialisé avec succès. Redirection vers la connexion...
                            </p>
                            <Link to="/login"
                                className="inline-block bg-primary text-white px-6 py-3 rounded-xl font-semibold text-sm hover:bg-primary/90 transition-colors">
                                Se connecter →
                            </Link>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-6">

                            {errors.general && (
                                <div className="p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm text-center">
                                    ❌ {errors.general}
                                </div>
                            )}

                            {/* Nouveau mot de passe */}
                            <div>
                                <label className="block text-sm font-medium text-text mb-1">
                                    Nouveau mot de passe
                                </label>
                                <div className="relative">
                                    <input
                                        type={showPass ? 'text' : 'password'}
                                        value={form.password}
                                        onChange={e => { setForm({...form, password: e.target.value}); setErrors({...errors, password: ''}); }}
                                        placeholder="Minimum 8 caractères"
                                        className={inputCls('password')}
                                    />
                                    <button type="button" onClick={() => setShowPass(!showPass)}
                                        className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600">
                                        {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                </div>
                                {/* Barre de force */}
                                {form.password && (
                                    <div className="mt-2 space-y-1">
                                        <div className="flex gap-1">
                                            {[1,2,3,4].map(i => (
                                                <div key={i} className={`h-1 flex-1 rounded-full transition-all ${i <= strength ? strengthColor : 'bg-gray-200'}`} />
                                            ))}
                                        </div>
                                        <p className="text-xs text-gray-500">Force : <span className="font-medium">{strengthLabel}</span></p>
                                    </div>
                                )}
                                {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password}</p>}
                            </div>

                            {/* Confirmer mot de passe */}
                            <div>
                                <label className="block text-sm font-medium text-text mb-1">
                                    Confirmer le nouveau mot de passe
                                </label>
                                <div className="relative">
                                    <input
                                        type={showConf ? 'text' : 'password'}
                                        value={form.confirm}
                                        onChange={e => { setForm({...form, confirm: e.target.value}); setErrors({...errors, confirm: ''}); }}
                                        placeholder="Répétez le mot de passe"
                                        className={inputCls('confirm')}
                                    />
                                    <button type="button" onClick={() => setShowConf(!showConf)}
                                        className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600">
                                        {showConf ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                </div>
                                {form.confirm && form.password === form.confirm && (
                                    <p className="mt-1 text-xs text-green-600">✓ Les mots de passe correspondent</p>
                                )}
                                {errors.confirm && <p className="mt-1 text-xs text-red-500">{errors.confirm}</p>}
                            </div>

                            <button type="submit" disabled={isLoading}
                                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-semibold text-white bg-primary hover:bg-primary/90 disabled:opacity-60 transition-colors">
                                {isLoading ? 'Réinitialisation...' : 'Réinitialiser le mot de passe'}
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};
