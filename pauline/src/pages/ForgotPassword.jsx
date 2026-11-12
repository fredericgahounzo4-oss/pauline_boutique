import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import emailjs from '@emailjs/browser';
import { apiUrl } from '../utils/api';

const inputCls = 'appearance-none block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm bg-background-alt border-gray-200';

export const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError('');
        setMessage('');
        if (!/^\S+@\S+\.\S+$/.test(email.trim())) {
            setError('Veuillez saisir une adresse e-mail valide.');
            return;
        }
        setIsLoading(true);
        try {
            // 1. Demander le token au backend
            const response = await fetch(apiUrl('/api/auth/forgot-password'), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: email.trim() }),
            });
            const data = await response.json().catch(() => ({}));
            if (!response.ok || !data.success) {
                throw new Error(data.error || "Impossible de traiter la demande.");
            }

            // 2. Si un token a été retourné, envoyer l'email via EmailJS (depuis le frontend)
            if (data.token) {
                await emailjs.send(
                    import.meta.env.VITE_EMAILJS_SERVICE_ID,
                    import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
                    {
                        to_email: data.user_email || email.trim(),
                        to_name: data.user_name || email.trim(),
                        reset_link: data.reset_url,
                        app_name: 'Pauline Boutique',
                    },
                    import.meta.env.VITE_EMAILJS_PUBLIC_KEY
                );
            }

            setMessage(data.message || 'Si un compte correspond à cette adresse, un lien vient de lui être envoyé.');
        } catch (err) {
            setError(err.message || 'Erreur réseau. Réessayez.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <Link to="/login" className="flex justify-center items-center gap-2 text-text-muted hover:text-primary mb-8 transition-colors">
                    <ArrowLeft size={16} /> Retour à la connexion
                </Link>
                <h2 className="text-center text-3xl font-serif font-bold text-text">Mot de passe oublié</h2>
                <p className="mt-2 text-center text-sm text-text-muted">Entrez votre adresse e-mail pour recevoir un lien sécurisé.</p>
            </div>
            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-surface py-8 px-4 shadow-xl sm:rounded-lg sm:px-10 border border-gray-100">
                    {error && <div role="alert" className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm">{error}</div>}
                    {message ? (
                        <div role="status" className="space-y-4 text-center">
                            <p className="text-sm text-green-700">{message}</p>
                            <p className="text-xs text-text-muted">Vérifiez également votre dossier courrier indésirable. Le lien expire après 30 minutes.</p>
                            <Link to="/login" className="inline-block text-primary font-semibold hover:underline">Retour à la connexion</Link>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label htmlFor="reset-email" className="block text-sm font-medium text-text mb-1">Adresse e-mail</label>
                                <input id="reset-email" type="email" autoComplete="email" required value={email}
                                    onChange={(event) => setEmail(event.target.value)} placeholder="exemple@email.com" className={inputCls} />
                            </div>
                            <button type="submit" disabled={isLoading}
                                className="w-full flex justify-center py-3 px-4 rounded-xl text-sm font-semibold text-white bg-primary hover:bg-primary/90 disabled:opacity-60 transition-colors">
                                {isLoading ? 'Envoi...' : 'Envoyer le lien de réinitialisation'}
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};
