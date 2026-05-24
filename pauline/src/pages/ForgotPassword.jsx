import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Eye, EyeOff } from 'lucide-react';
import emailjs from '@emailjs/browser';
import { apiUrl } from '../utils/api';

const SERVICE_ID  = import.meta.env.VITE_EMAILJS_SERVICE_ID;
const TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
const PUBLIC_KEY  = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

function generateCode() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

const inputCls = (err) =>
    `appearance-none block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm bg-background-alt ${err ? 'border-red-400' : 'border-gray-200'}`;

export const ForgotPassword = () => {
    const navigate = useNavigate();
    const [step, setStep]           = useState(1);
    const [email, setEmail]         = useState('');
    const [nomUser, setNomUser]     = useState('');
    const [sentCode, setSentCode]   = useState('');
    const [inputCode, setInputCode] = useState('');
    const [password, setPassword]   = useState('');
    const [confirm, setConfirm]     = useState('');
    const [showPass, setShowPass]   = useState(false);
    const [showConf, setShowConf]   = useState(false);
    const [error, setError]         = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [success, setSuccess]     = useState(false);

    const getStrength = (pwd) => {
        if (!pwd) return 0;
        let s = 0;
        if (pwd.length >= 8) s++;
        if (/[A-Z]/.test(pwd)) s++;
        if (/[0-9]/.test(pwd)) s++;
        if (/[^A-Za-z0-9]/.test(pwd)) s++;
        return s;
    };
    const strength = getStrength(password);
    const strengthLabel = ['', 'Faible', 'Moyen', 'Bon', 'Fort'][strength];
    const strengthColor = ['', 'bg-red-400', 'bg-orange-400', 'bg-yellow-400', 'bg-green-500'][strength];

    const handleEmailSubmit = async (e) => {
        e.preventDefault();
        setError('');
        if (!email || !/\S+@\S+\.\S+/.test(email)) { setError("E-mail invalide."); return; }
        setIsLoading(true);
        try {
            const res = await fetch(apiUrl('/api/auth/check-email'), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });
            const data = await res.json();
            if (!data.exists) { setError("Aucun compte trouvé avec cet e-mail."); setIsLoading(false); return; }
            const code = generateCode();
            setSentCode(code);
            setNomUser(data.nom || email);
            await emailjs.send(SERVICE_ID, TEMPLATE_ID, {
                email, name: data.nom || email, reset_code: code, app_name: 'Pauline Boutique',
            }, PUBLIC_KEY);
            setStep(2);
        } catch { setError("Erreur lors de l'envoi. Vérifiez votre connexion."); }
        finally { setIsLoading(false); }
    };

    const handleCodeSubmit = (e) => {
        e.preventDefault();
        setError('');
        if (!inputCode.trim()) { setError("Entrez le code reçu."); return; }
        if (inputCode.trim() !== sentCode) { setError("Code incorrect."); return; }
        setStep(3);
    };

    const handlePasswordSubmit = async (e) => {
        e.preventDefault();
        setError('');
        if (!password || password.length < 8) { setError("Minimum 8 caractères."); return; }
        if (password !== confirm) { setError("Les mots de passe ne correspondent pas."); return; }
        setIsLoading(true);
        try {
            const res = await fetch(apiUrl('/api/auth/reset-password'), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, new_password: password })
            });
            const data = await res.json();
            if (!data.success) { setError("Erreur lors de la réinitialisation."); }
            else { setSuccess(true); setTimeout(() => navigate('/login'), 3000); }
        } catch { setError("Erreur réseau."); }
        finally { setIsLoading(false); }
    };

    return (
        <div className="min-h-screen bg-background flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <Link to="/login" className="flex justify-center items-center gap-2 text-text-muted hover:text-primary mb-8 transition-colors">
                    <ArrowLeft size={16} /> Retour à la connexion
                </Link>
                <h2 className="text-center text-3xl font-serif font-bold text-text">Mot de passe oublié</h2>
                <p className="mt-2 text-center text-sm text-text-muted">
                    {step === 1 && "Entrez votre e-mail pour recevoir un code"}
                    {step === 2 && "Entrez le code reçu par e-mail"}
                    {step === 3 && "Choisissez votre nouveau mot de passe"}
                </p>
                <div className="flex items-center justify-center gap-2 mt-4">
                    {[1,2,3].map(s => (
                        <div key={s} className="flex items-center gap-2">
                            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${step > s ? 'bg-green-500 text-white' : step === s ? 'bg-primary text-white' : 'bg-gray-200 text-gray-400'}`}>
                                {step > s ? '✓' : s}
                            </div>
                            {s < 3 && <div className={`w-8 h-0.5 ${step > s ? 'bg-green-500' : 'bg-gray-200'}`} />}
                        </div>
                    ))}
                </div>
            </div>
            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-surface py-8 px-4 shadow-xl sm:rounded-lg sm:px-10 border border-gray-100">
                    {success ? (
                        <div className="text-center space-y-4">
                            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto text-3xl">✅</div>
                            <h3 className="text-lg font-semibold text-text">Mot de passe modifié !</h3>
                            <p className="text-sm text-text-muted">Redirection vers la connexion...</p>
                            <Link to="/login" className="inline-block bg-primary text-white px-6 py-3 rounded-xl font-semibold text-sm hover:bg-primary/90 transition-colors">Se connecter →</Link>
                        </div>
                    ) : (
                        <>
                            {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm text-center">❌ {error}</div>}

                            {step === 1 && (
                                <form onSubmit={handleEmailSubmit} className="space-y-6">
                                    <div>
                                        <label className="block text-sm font-medium text-text mb-1">Adresse e-mail</label>
                                        <input type="email" value={email} onChange={e => { setEmail(e.target.value); setError(''); }}
                                            placeholder="exemple@email.com" className={inputCls(error)} />
                                    </div>
                                    <button type="submit" disabled={isLoading}
                                        className="w-full flex justify-center py-3 px-4 rounded-xl text-sm font-semibold text-white bg-primary hover:bg-primary/90 disabled:opacity-60 transition-colors">
                                        {isLoading ? 'Envoi...' : 'Envoyer le code →'}
                                    </button>
                                </form>
                            )}

                            {step === 2 && (
                                <form onSubmit={handleCodeSubmit} className="space-y-6">
                                    <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-3 text-sm text-blue-700">
                                        📧 Code envoyé à <strong>{email}</strong>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-text mb-1">Code de vérification</label>
                                        <input type="text" value={inputCode}
                                            onChange={e => { setInputCode(e.target.value.replace(/\D/g,'').slice(0,6)); setError(''); }}
                                            placeholder="123456" maxLength={6}
                                            className={`${inputCls(error)} text-center text-2xl tracking-widest font-bold`} />
                                        <p className="mt-1 text-xs text-gray-400 text-center">Copiez le code reçu par e-mail</p>
                                    </div>
                                    <button type="submit" className="w-full flex justify-center py-3 px-4 rounded-xl text-sm font-semibold text-white bg-primary hover:bg-primary/90 transition-colors">
                                        Vérifier le code →
                                    </button>
                                    <button type="button" onClick={() => { setStep(1); setError(''); setInputCode(''); }}
                                        className="w-full text-sm text-primary hover:underline">← Changer d'adresse</button>
                                </form>
                            )}

                            {step === 3 && (
                                <form onSubmit={handlePasswordSubmit} className="space-y-6">
                                    <div className="bg-green-50 border border-green-200 rounded-lg px-4 py-3 text-sm text-green-700">
                                        ✅ Bonjour <strong>{nomUser}</strong>, choisissez votre nouveau mot de passe.
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-text mb-1">Nouveau mot de passe</label>
                                        <div className="relative">
                                            <input type={showPass ? 'text' : 'password'} value={password}
                                                onChange={e => { setPassword(e.target.value); setError(''); }}
                                                placeholder="Minimum 8 caractères" className={inputCls(false)} />
                                            <button type="button" onClick={() => setShowPass(!showPass)}
                                                className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600">
                                                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                                            </button>
                                        </div>
                                        {password && (
                                            <div className="mt-2 space-y-1">
                                                <div className="flex gap-1">
                                                    {[1,2,3,4].map(i => (
                                                        <div key={i} className={`h-1 flex-1 rounded-full ${i <= strength ? strengthColor : 'bg-gray-200'}`} />
                                                    ))}
                                                </div>
                                                <p className="text-xs text-gray-500">Force : <span className="font-medium">{strengthLabel}</span></p>
                                            </div>
                                        )}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-text mb-1">Confirmer le mot de passe</label>
                                        <div className="relative">
                                            <input type={showConf ? 'text' : 'password'} value={confirm}
                                                onChange={e => { setConfirm(e.target.value); setError(''); }}
                                                placeholder="Répétez le mot de passe" className={inputCls(false)} />
                                            <button type="button" onClick={() => setShowConf(!showConf)}
                                                className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600">
                                                {showConf ? <EyeOff size={16} /> : <Eye size={16} />}
                                            </button>
                                        </div>
                                        {confirm && password === confirm && <p className="mt-1 text-xs text-green-600">✓ Les mots de passe correspondent</p>}
                                    </div>
                                    <button type="submit" disabled={isLoading}
                                        className="w-full flex justify-center py-3 px-4 rounded-xl text-sm font-semibold text-white bg-primary hover:bg-primary/90 disabled:opacity-60 transition-colors">
                                        {isLoading ? 'Réinitialisation...' : '🔒 Réinitialiser le mot de passe'}
                                    </button>
                                </form>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};
