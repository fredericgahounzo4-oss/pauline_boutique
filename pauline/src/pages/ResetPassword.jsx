import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Eye, EyeOff, ArrowLeft } from 'lucide-react';

export const ResetPassword = () => {
    const { token } = useParams();
    const navigate = useNavigate();

    const [form, setForm] = useState({
        password: '',
        confirm: ''
    });

    const [showPwd, setShowPwd] = useState(false);
    const [showConf, setShowConf] = useState(false);

    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const validate = () => {
        if (!form.password || form.password.length < 8)
            return "Le mot de passe doit contenir au moins 8 caractères.";

        if (form.password !== form.confirm)
            return "Les mots de passe ne correspondent pas.";

        return null;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const err = validate();
        if (err) {
            setError(err);
            return;
        }

        setIsLoading(true);
        setError('');

        try {
            const res = await fetch('/api/auth/reset-password/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    token,
                    password: form.password,
                    confirm: form.confirm
                }),
            });

            const data = await res.json();

            if (data.success) {
                setSuccess(true);
                setTimeout(() => navigate('/login'), 3000);
            } else {
                setError(data.error || "Lien invalide ou expiré.");
            }

        } catch {
            setError("Erreur réseau. Vérifiez votre connexion.");
        } finally {
            setIsLoading(false);
        }
    };

    const inputCls = (hasErr) =>
        `appearance-none block w-full px-3 py-2 border rounded-md shadow-sm
        focus:outline-none focus:ring-primary focus:border-primary sm:text-sm bg-background-alt
        ${hasErr ? 'border-red-400' : 'border-gray-200'}`;

    return (
        <div className="min-h-screen bg-background flex flex-col justify-center py-12 sm:px-6 lg:px-8">

            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <Link to="/login" className="flex justify-center items-center gap-2 text-text-muted hover:text-primary mb-8">
                    <ArrowLeft size={16} /> Retour à la connexion
                </Link>

                <h2 className="text-center text-3xl font-serif font-bold text-text">
                    Nouveau mot de passe
                </h2>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-surface py-8 px-4 shadow-xl sm:rounded-lg sm:px-10 border border-gray-100">

                    {success ? (
                        <div className="text-center space-y-4">
                            <div className="text-4xl">✅</div>
                            <h3 className="text-lg font-semibold">Mot de passe modifié !</h3>
                            <p className="text-sm text-text-muted">
                                Redirection vers la connexion...
                            </p>
                        </div>
                    ) : (
                        <>
                            {error && (
                                <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm text-center rounded">
                                    ❌ {error}
                                </div>
                            )}

                            <form onSubmit={handleSubmit} className="space-y-5">

                                {/* Password */}
                                <div>
                                    <label className="text-sm">Nouveau mot de passe</label>
                                    <div className="relative mt-1">
                                        <input
                                            type={showPwd ? 'text' : 'password'}
                                            value={form.password}
                                            onChange={(e) => {
                                                setForm({ ...form, password: e.target.value });
                                                setError('');
                                            }}
                                            className={inputCls(!!error)}
                                        />
                                        <button type="button" onClick={() => setShowPwd(!showPwd)}
                                            className="absolute right-3 top-2 text-gray-400">
                                            {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                                        </button>
                                    </div>
                                </div>

                                {/* Confirm */}
                                <div>
                                    <label className="text-sm">Confirmer mot de passe</label>
                                    <div className="relative mt-1">
                                        <input
                                            type={showConf ? 'text' : 'password'}
                                            value={form.confirm}
                                            onChange={(e) => {
                                                setForm({ ...form, confirm: e.target.value });
                                                setError('');
                                            }}
                                            className={inputCls(!!error)}
                                        />
                                        <button type="button" onClick={() => setShowConf(!showConf)}
                                            className="absolute right-3 top-2 text-gray-400">
                                            {showConf ? <EyeOff size={16} /> : <Eye size={16} />}
                                        </button>
                                    </div>
                                </div>

                                <Button className="w-full py-3" disabled={isLoading}>
                                    {isLoading ? 'Modification...' : 'Modifier le mot de passe'}
                                </Button>

                            </form>
                        </>
                    )}

                </div>
            </div>
        </div>
    );
};