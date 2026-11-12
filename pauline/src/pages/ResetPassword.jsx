import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { apiUrl } from '../utils/api';

const inputCls = 'appearance-none block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm bg-background-alt border-gray-200';

export const ResetPassword = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const emailFromState = location.state?.email || '';

    // Étape 1 : saisir le code — Étape 2 : saisir le nouveau mot de passe
    const [step, setStep] = useState(1);
    const [code, setCode] = useState('');
    const [validatedCode, setValidatedCode] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    // ── Étape 1 : vérifier le code ───────────────────────────────────────────
    const handleVerifyCode = async (event) => {
        event.preventDefault();
        setError('');
        const trimmed = code.trim();
        if (!/^\d{6}$/.test(trimmed)) {
            setError('Le code doit contenir exactement 6 chiffres.');
            return;
        }
        setIsLoading(true);
        try {
            const response = await fetch(apiUrl('/api/auth/verify-reset-code'), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ code: trimmed }),
            });
            const data = await response.json().catch(() => ({}));
            if (!response.ok || !data.valid) {
                throw new Error(data.error || 'Code invalide ou expiré.');
            }
            setValidatedCode(trimmed);
            setStep(2);
        } catch (err) {
            setError(err.message || 'Erreur réseau. Réessayez.');
        } finally {
            setIsLoading(false);
        }
    };

    // ── Étape 2 : changer le mot de passe ────────────────────────────────────
    const handleResetPassword = async (event) => {
        event.preventDefault();
        setError('');
        if (newPassword.length < 8) {
            setError('Le mot de passe doit contenir au moins 8 caractères.');
            return;
        }
        if (newPassword !== confirmPassword) {
            setError('Les mots de passe ne correspondent pas.');
            return;
        }
        setIsLoading(true);
        try {
            const response = await fetch(apiUrl('/api/auth/reset-password-token'), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ code: validatedCode, new_password: newPassword }),
            });
            const data = await response.json().catch(() => ({}));
            if (!response.ok || !data.success) {
                throw new Error(data.error || 'Impossible de réinitialiser le mot de passe.');
            }
            setStep(3);
        } catch (err) {
            setError(err.message || 'Erreur réseau. Réessayez.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                {step < 3 && (
                    <Link to="/forgot-password" className="flex justify-center items-center gap-2 text-text-muted hover:text-primary mb-8 transition-colors">
                        <ArrowLeft size={16} /> Retour
                    </Link>
                )}
                <h2 className="text-center text-3xl font-serif font-bold text-text">
                    {step === 1 && 'Entrez le code'}
                    {step === 2 && 'Nouveau mot de passe'}
                    {step === 3 && 'Mot de passe modifié !'}
                </h2>
                {step === 1 && (
                    <p className="mt-2 text-center text-sm text-text-muted">
                        Saisissez le code à 6 chiffres envoyé{emailFromState ? ` à ${emailFromState}` : ' par e-mail'}.
                    </p>
                )}
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-surface py-8 px-4 shadow-xl sm:rounded-lg sm:px-10 border border-gray-100">
                    {error && (
                        <div role="alert" className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm">{error}</div>
                    )}

                    {/* ── Étape 1 : code ── */}
                    {step === 1 && (
                        <form onSubmit={handleVerifyCode} className="space-y-6">
                            <div>
                                <label htmlFor="code" className="block text-sm font-medium text-text mb-1">Code de vérification</label>
                                <input
                                    id="code"
                                    type="text"
                                    inputMode="numeric"
                                    maxLength={6}
                                    required
                                    value={code}
                                    onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                                    placeholder="123456"
                                    className={`${inputCls} text-center text-2xl tracking-widest font-mono`}
                                />
                                <p className="mt-1 text-xs text-text-muted text-center">Le code expire après 30 minutes.</p>
                            </div>
                            <button type="submit" disabled={isLoading}
                                className="w-full flex justify-center py-3 px-4 rounded-xl text-sm font-semibold text-white bg-primary hover:bg-primary/90 disabled:opacity-60 transition-colors">
                                {isLoading ? 'Vérification...' : 'Vérifier le code'}
                            </button>
                            <p className="text-center text-sm text-text-muted">
                                Pas reçu le code ?{' '}
                                <Link to="/forgot-password" className="text-primary font-semibold hover:underline">Renvoyer</Link>
                            </p>
                        </form>
                    )}

                    {/* ── Étape 2 : nouveau mot de passe ── */}
                    {step === 2 && (
                        <form onSubmit={handleResetPassword} className="space-y-6">
                            <div>
                                <label htmlFor="new-password" className="block text-sm font-medium text-text mb-1">Nouveau mot de passe</label>
                                <div className="relative">
                                    <input
                                        id="new-password"
                                        type={showPassword ? 'text' : 'password'}
                                        required
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        placeholder="Minimum 8 caractères"
                                        className={inputCls}
                                    />
                                    <button type="button" onClick={() => setShowPassword(!showPassword)}
                                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-text-muted hover:text-text">
                                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                </div>
                            </div>
                            <div>
                                <label htmlFor="confirm-password" className="block text-sm font-medium text-text mb-1">Confirmer le mot de passe</label>
                                <div className="relative">
                                    <input
                                        id="confirm-password"
                                        type={showConfirm ? 'text' : 'password'}
                                        required
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        placeholder="Répétez le mot de passe"
                                        className={inputCls}
                                    />
                                    <button type="button" onClick={() => setShowConfirm(!showConfirm)}
                                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-text-muted hover:text-text">
                                        {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                </div>
                            </div>
                            <button type="submit" disabled={isLoading}
                                className="w-full flex justify-center py-3 px-4 rounded-xl text-sm font-semibold text-white bg-primary hover:bg-primary/90 disabled:opacity-60 transition-colors">
                                {isLoading ? 'Enregistrement...' : 'Enregistrer le nouveau mot de passe'}
                            </button>
                        </form>
                    )}

                    {/* ── Étape 3 : succès ── */}
                    {step === 3 && (
                        <div className="text-center space-y-4">
                            <div className="text-5xl">✅</div>
                            <p className="text-sm text-green-700 font-medium">Votre mot de passe a été réinitialisé avec succès !</p>
                            <Link to="/login"
                                className="inline-block w-full text-center py-3 px-4 rounded-xl text-sm font-semibold text-white bg-primary hover:bg-primary/90 transition-colors">
                                Se connecter
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
