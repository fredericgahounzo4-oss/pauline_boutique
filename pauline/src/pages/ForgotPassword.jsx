import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { ArrowLeft, Eye, EyeOff, Mail, KeyRound, Lock } from 'lucide-react';
import { sendResetPasswordEmail } from '../services/emailjs';

const API_URL = import.meta.env.VITE_API_URL || '';

// ─── Constantes ─────────────────────────────────────────────
const STEP_EMAIL = 1;
const STEP_CODE = 2;
const STEP_PASSWORD = 3;
const RESEND_DELAY = 60;

export const ForgotPassword = () => {
    const navigate = useNavigate();

    const [step, setStep] = useState(STEP_EMAIL);
    const [email, setEmail] = useState('');
    const [resetToken, setToken] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setLoading] = useState(false);

    const [digits, setDigits] = useState(['', '', '', '', '', '']);
    const [resendTimer, setResendTimer] = useState(0);
    const inputRefs = useRef([]);

    const [password, setPassword] = useState('');
    const [confirm, setConfirm] = useState('');
    const [showPwd, setShowPwd] = useState(false);
    const [showConf, setShowConf] = useState(false);
    const [done, setDone] = useState(false);

    useEffect(() => {
        if (resendTimer <= 0) return;
        const t = setTimeout(() => setResendTimer(r => r - 1), 1000);
        return () => clearTimeout(t);
    }, [resendTimer]);

    // ─────────────────────────────────────────────
    // ÉTAPE 1 : envoyer email + EmailJS
    // ─────────────────────────────────────────────
    const handleSendEmail = async (e) => {
        e.preventDefault();

        if (!email || !/\S+@\S+\.\S+/.test(email)) {
            setError('Email invalide');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const res = await fetch(`${API_URL}/api/auth/forgot-password/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });

            const data = await res.json();

            if (data.success) {
                // 🔥 EmailJS envoi email
                await sendResetPasswordEmail(
                    data.email,
                    data.code,
                    data.name
                );

                setStep(STEP_CODE);
                setResendTimer(RESEND_DELAY);
            } else {
                setError(data.error || "Erreur envoi code");
            }

        } catch {
            setError('Erreur réseau');
        } finally {
            setLoading(false);
        }
    };

    // ─────────────────────────────────────────────
    // ÉTAPE 2 : vérification code
    // ─────────────────────────────────────────────
    const handleVerifyCode = async (e) => {
        e.preventDefault();

        const code = digits.join('');

        if (code.length < 6) {
            setError('Code incomplet');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const res = await fetch(`${API_URL}/api/auth/verify-reset-code/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, code }),
            });

            const data = await res.json();

            if (data.success) {
                setToken(data.token);
                setStep(STEP_PASSWORD);
            } else {
                setError(data.error);
                setDigits(['', '', '', '', '', '']);
            }

        } catch {
            setError('Erreur réseau');
        } finally {
            setLoading(false);
        }
    };

    // ─────────────────────────────────────────────
    // ÉTAPE 3 : reset password
    // ─────────────────────────────────────────────
    const handleResetPassword = async (e) => {
        e.preventDefault();

        if (password !== confirm) {
            setError('Mots de passe différents');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const res = await fetch(`${API_URL}/api/auth/reset-password/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    token: resetToken,
                    password,
                    confirm
                }),
            });

            const data = await res.json();

            if (data.success) {
                setDone(true);
                setTimeout(() => navigate('/login'), 3000);
            } else {
                setError(data.error);
            }

        } catch {
            setError('Erreur réseau');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="w-full max-w-md">

                <h2 className="text-center text-2xl font-bold">
                    Mot de passe oublié
                </h2>

                {/* STEP 1 */}
                {step === STEP_EMAIL && (
                    <form onSubmit={handleSendEmail} className="space-y-4 mt-6">
                        <input
                            type="email"
                            placeholder="Email"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            className="w-full p-2 border rounded"
                        />

                        <Button disabled={isLoading}>
                            Envoyer code
                        </Button>

                        {error && <p className="text-red-500">{error}</p>}
                    </form>
                )}

                {/* STEP 2 */}
                {step === STEP_CODE && (
                    <form onSubmit={handleVerifyCode} className="space-y-4 mt-6">
                        <div className="flex gap-2 justify-center">
                            {digits.map((d, i) => (
                                <input
                                    key={i}
                                    maxLength={1}
                                    value={d}
                                    onChange={e => {
                                        const copy = [...digits];
                                        copy[i] = e.target.value;
                                        setDigits(copy);
                                    }}
                                    className="w-10 h-10 text-center border"
                                />
                            ))}
                        </div>

                        <Button>Vérifier code</Button>

                        {error && <p className="text-red-500">{error}</p>}
                    </form>
                )}

                {/* STEP 3 */}
                {step === STEP_PASSWORD && (
                    <form onSubmit={handleResetPassword} className="space-y-4 mt-6">

                        <input
                            type="password"
                            placeholder="Nouveau mot de passe"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            className="w-full p-2 border"
                        />

                        <input
                            type="password"
                            placeholder="Confirmer"
                            value={confirm}
                            onChange={e => setConfirm(e.target.value)}
                            className="w-full p-2 border"
                        />

                        <Button>Modifier</Button>

                        {error && <p className="text-red-500">{error}</p>}

                        {done && (
                            <p className="text-green-500">
                                Mot de passe modifié ✔
                            </p>
                        )}
                    </form>
                )}

            </div>
        </div>
    );
};
