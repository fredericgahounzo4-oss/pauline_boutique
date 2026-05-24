import { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { Button } from '../components/ui/Button';
import { useNavigate, Link } from 'react-router-dom';

// ─── Config FedaPay ───────────────────────────────────────────────────────────
const FEDAPAY_PUBLIC_KEY = import.meta.env.VITE_FEDAPAY_PUBLIC_KEY || 'pk_sandbox_VOTRE_CLE';
const FEDAPAY_MODE       = import.meta.env.VITE_FEDAPAY_MODE       || 'sandbox';

function loadFedaPaySDK() {
    return new Promise((resolve, reject) => {
        if (window.FedaPay) { resolve(); return; }
        if (document.getElementById('fedapay-sdk')) {
            const check = setInterval(() => {
                if (window.FedaPay) { clearInterval(check); resolve(); }
            }, 100);
            return;
        }
        const script = document.createElement('script');
        script.id = 'fedapay-sdk';
        script.src = 'https://cdn.fedapay.com/checkout.js?v=1.1.7';
        script.async = true;
        script.onload = () => resolve();
        script.onerror = () => reject(new Error('SDK FedaPay introuvable'));
        document.body.appendChild(script);
    });
}

// ─── Petits composants UI ─────────────────────────────────────────────────────
const Field = ({ error, children }) => (
    <div className="space-y-1">
        {children}
        {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
);

const inputCls = (err) =>
    `w-full border rounded-lg px-4 py-3 text-sm outline-none transition-colors focus:ring-2 focus:ring-primary/30 ${
        err ? 'border-red-400 bg-red-50' : 'border-gray-200 focus:border-primary'
    }`;

const BackButton = ({ onClick }) => (
    <button type="button" onClick={onClick}
        className="flex items-center gap-1 text-sm text-primary mb-6 hover:underline">
        ← Retour
    </button>
);

// ─── Composant principal ──────────────────────────────────────────────────────
export const Checkout = () => {
    const { cart, cartTotal, clearCart, addOrder } = useCart();
    const navigate = useNavigate();

    const [step, setStep]                 = useState('delivery');
    const [sdkReady, setSdkReady]         = useState(false);
    const [sdkError, setSdkError]         = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [globalError, setGlobalError]   = useState('');

    const [delivery, setDelivery] = useState({
        firstName: '', lastName: '', email: '', phone: '', address: '', city: '', zip: ''
    });
    const [deliveryErrors, setDeliveryErrors] = useState({});

    // ─── Chargement SDK FedaPay ───────────────────────────────────────────────
    useEffect(() => {
        loadFedaPaySDK()
            .then(() => setSdkReady(true))
            .catch(() => setSdkError('Service de paiement FedaPay indisponible. Rechargez la page.'));
    }, []);

    // ─── Validation livraison ─────────────────────────────────────────────────
    const validateDelivery = () => {
        const e = {};
        if (!delivery.firstName.trim()) e.firstName = 'Requis';
        if (!delivery.lastName.trim())  e.lastName  = 'Requis';
        if (!delivery.email || !/\S+@\S+\.\S+/.test(delivery.email)) e.email = 'E-mail invalide';
        if (!delivery.phone.trim())   e.phone   = 'Requis';
        if (!delivery.address.trim()) e.address = 'Requis';
        if (!delivery.city.trim())    e.city    = 'Requis';
        return e;
    };

    const handleDeliverySubmit = (e) => {
        e.preventDefault();
        const errs = validateDelivery();
        if (Object.keys(errs).length) { setDeliveryErrors(errs); return; }
        setStep('payment');
    };

    // ─── Lancer le widget FedaPay ─────────────────────────────────────────────
    const triggerFedaPay = () => {
        return new Promise((resolve, reject) => {
            if (!sdkReady || typeof window.FedaPay === 'undefined') {
                reject(new Error('SDK FedaPay non prêt. Rechargez la page.'));
                return;
            }

            window.FedaPay.init({
                public_key:  FEDAPAY_PUBLIC_KEY,
                environment: FEDAPAY_MODE,
                transaction: {
                    amount:      cartTotal,
                    description: 'Commande Pauline Boutique',
                },
                customer: {
                    firstname: delivery.firstName,
                    lastname:  delivery.lastName,
                    email:     delivery.email,
                    phone_number: {
                        number:  delivery.phone,
                        country: 'TG',
                    },
                },
                onComplete: function(resp) {
                    const t = resp.transaction;
                    if (t && (t.status === 'approved' || t.status === 'approved_pending_transfer')) {
                        resolve({ transactionId: String(t.id), status: t.status });
                    } else if (t && t.status === 'pending') {
                        resolve({ transactionId: String(t.id), status: 'pending' });
                    } else {
                        reject(new Error('Paiement non complété ou annulé.'));
                    }
                },
            }).open();
        });
    };

    // ─── Enregistrer la commande dans Django ──────────────────────────────────
    const saveOrderToDB = async (transactionId, method) => {
        const user = JSON.parse(localStorage.getItem('pauline_user') || 'null');

        const payload = {
            utilisateur_id:   user?.id || null,
            items:            cart,
            montant_total:    cartTotal,
            methode_paiement: method,
            operateur_mobile: 'FEDAPAY',
            transaction_id:   transactionId,
            adresse_livraison: {
                prenom:      delivery.firstName,
                nom:         delivery.lastName,
                email:       delivery.email,
                telephone:   delivery.phone,
                adresse:     delivery.address,
                ville:       delivery.city,
                code_postal: delivery.zip || '',
            }
        };

        const res = await fetch('/api/commandes/create', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const data = await res.json();
        if (!res.ok || !data.success) {
            throw new Error(data.error || "Erreur lors de l'enregistrement de la commande.");
        }
        return data;
    };

    // ─── Finaliser ────────────────────────────────────────────────────────────
    const finalizeOrder = async (transactionId, method) => {
        try {
            const dbResult = await saveOrderToDB(transactionId, method);

            addOrder({
                id:            dbResult.commande_id.toString(),
                numero:        dbResult.numero_commande,
                transactionId,
                date:          new Date().toLocaleDateString('fr-FR', {
                                   year: 'numeric', month: 'long', day: 'numeric'
                               }),
                total:         cartTotal,
                items:         [...cart],
                paymentMethod: method,
                customer:      { ...delivery }
            });

            clearCart();
            setStep('success');
        } catch (err) {
            setGlobalError(err.message || 'Erreur réseau.');
        }
    };

    // ─── Soumission paiement FedaPay ──────────────────────────────────────────
    const handlePayment = async (e) => {
        e.preventDefault();
        setIsProcessing(true);
        setGlobalError('');

        try {
            const { transactionId, status } = await triggerFedaPay();
            if (status === 'pending') {
                alert('Paiement en cours de validation. Vous recevrez une confirmation.');
            }
            await finalizeOrder(transactionId, 'mobile_money');
        } catch (err) {
            setGlobalError(err.message || 'Paiement annulé ou erreur.');
        } finally {
            setIsProcessing(false);
        }
    };

    // ─── Panier vide ──────────────────────────────────────────────────────────
    if (cart.length === 0 && step !== 'success') {
        return (
            <div className="p-20 text-center text-lg">
                <p className="mb-4">Votre panier est vide.</p>
                <Link to="/shop"><Button>Continuer mes achats</Button></Link>
            </div>
        );
    }

    // ─── SUCCÈS ───────────────────────────────────────────────────────────────
    if (step === 'success') {
        return (
            <div className="pt-20 pb-20 px-4 max-w-7xl mx-auto flex flex-col items-center text-center space-y-6">
                <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center text-green-600 text-4xl">✔</div>
                <h1 className="text-4xl font-serif font-bold text-text">Commande Confirmée !</h1>
                <p className="text-text-muted max-w-md">
                    Merci pour votre achat. Votre commande a bien été enregistrée.
                </p>
                <div className="flex gap-4 flex-wrap justify-center">
                    <Button onClick={() => navigate('/orders')}>Voir mes commandes</Button>
                    <Button variant="outline" onClick={() => navigate('/')}>Retour à l'accueil</Button>
                </div>
            </div>
        );
    }

    return (
        <div className="pt-8 pb-20 px-4 max-w-7xl mx-auto">
            <h1 className="text-3xl font-serif font-bold text-text mb-8">Paiement</h1>

            {sdkError && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                    ⚠️ {sdkError}
                </div>
            )}

            <div className="grid md:grid-cols-2 gap-12 items-start">

                {/* ── COLONNE GAUCHE : étapes ── */}
                <div>

                    {/* ÉTAPE 1 : Livraison */}
                    {step === 'delivery' && (
                        <form onSubmit={handleDeliverySubmit} className="space-y-5">
                            <h2 className="text-xl font-medium mb-2">Informations de livraison</h2>

                            <div className="grid grid-cols-2 gap-4">
                                <Field error={deliveryErrors.firstName}>
                                    <input value={delivery.firstName}
                                        onChange={e => { setDelivery({...delivery, firstName: e.target.value}); setDeliveryErrors({...deliveryErrors, firstName: ''}); }}
                                        placeholder="Prénom" className={inputCls(deliveryErrors.firstName)} />
                                </Field>
                                <Field error={deliveryErrors.lastName}>
                                    <input value={delivery.lastName}
                                        onChange={e => { setDelivery({...delivery, lastName: e.target.value}); setDeliveryErrors({...deliveryErrors, lastName: ''}); }}
                                        placeholder="Nom de famille" className={inputCls(deliveryErrors.lastName)} />
                                </Field>
                            </div>

                            <Field error={deliveryErrors.email}>
                                <input type="email" value={delivery.email}
                                    onChange={e => { setDelivery({...delivery, email: e.target.value}); setDeliveryErrors({...deliveryErrors, email: ''}); }}
                                    placeholder="Adresse e-mail" className={inputCls(deliveryErrors.email)} />
                            </Field>

                            <Field error={deliveryErrors.phone}>
                                <input value={delivery.phone}
                                    onChange={e => { setDelivery({...delivery, phone: e.target.value}); setDeliveryErrors({...deliveryErrors, phone: ''}); }}
                                    placeholder="Téléphone (ex: +228 90 00 00 00)" className={inputCls(deliveryErrors.phone)} />
                            </Field>

                            <Field error={deliveryErrors.address}>
                                <input value={delivery.address}
                                    onChange={e => { setDelivery({...delivery, address: e.target.value}); setDeliveryErrors({...deliveryErrors, address: ''}); }}
                                    placeholder="Adresse" className={inputCls(deliveryErrors.address)} />
                            </Field>

                            <div className="grid grid-cols-2 gap-4">
                                <Field error={deliveryErrors.city}>
                                    <input value={delivery.city}
                                        onChange={e => { setDelivery({...delivery, city: e.target.value}); setDeliveryErrors({...deliveryErrors, city: ''}); }}
                                        placeholder="Ville" className={inputCls(deliveryErrors.city)} />
                                </Field>
                                <Field>
                                    <input value={delivery.zip}
                                        onChange={e => setDelivery({...delivery, zip: e.target.value})}
                                        placeholder="Code Postal (optionnel)" className={inputCls(false)} />
                                </Field>
                            </div>

                            <button type="submit"
                                className="w-full mt-2 bg-primary hover:bg-primary/90 text-white font-semibold rounded-xl py-4 text-base transition-colors">
                                Continuer vers le paiement →
                            </button>
                        </form>
                    )}

                    {/* ÉTAPE 2 : Paiement FedaPay */}
                    {step === 'payment' && (
                        <form onSubmit={handlePayment} className="space-y-5">
                            <BackButton onClick={() => { setStep('delivery'); setGlobalError(''); }} />

                            <h2 className="text-xl font-medium mb-4">Paiement sécurisé</h2>

                            {/* Badge montant */}
                            <div className="flex items-center justify-between bg-primary/10 border border-primary/30 rounded-lg px-4 py-3">
                                <span className="text-sm font-medium text-primary">💳 Total à payer</span>
                                <span className="font-bold text-primary">{cartTotal.toLocaleString('fr-FR')} FCFA</span>
                            </div>

                            {/* Info FedaPay */}
                            <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-4 space-y-2">
                                <p className="text-sm font-semibold text-blue-800">🔐 Paiement via FedaPay</p>
                                <p className="text-xs text-blue-600">
                                    En cliquant sur "Payer", une fenêtre sécurisée FedaPay s'ouvrira. 
                                    Vous pourrez payer par :
                                </p>
                                <ul className="text-xs text-blue-600 space-y-1 ml-3">
                                    <li>📱 <strong>T-Money</strong> (Togocel)</li>
                                    <li>📱 <strong>Flooz</strong> (Moov)</li>
                                    <li>💳 <strong>Carte bancaire</strong> (Visa / Mastercard)</li>
                                </ul>
                            </div>

                            {FEDAPAY_MODE === 'sandbox' && (
                                <p className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded px-3 py-2 text-center">
                                    ⚠️ Mode TEST — aucun vrai paiement effectué
                                </p>
                            )}

                            {globalError && (
                                <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
                                    ❌ {globalError}
                                </p>
                            )}

                            <button type="submit"
                                disabled={isProcessing || !sdkReady}
                                className="w-full mt-2 bg-primary hover:bg-primary/90 disabled:opacity-60 text-white font-semibold rounded-xl py-4 text-base transition-colors flex items-center justify-center gap-2">
                                {isProcessing ? 'Traitement...' : `🔒 Payer ${cartTotal.toLocaleString('fr-FR')} FCFA →`}
                            </button>

                            <p className="text-xs text-center text-gray-400">
                                Paiement sécurisé par <strong>FedaPay</strong> · Vos données sont protégées
                            </p>
                        </form>
                    )}
                </div>

                {/* ── COLONNE DROITE : récapitulatif ── */}
                <div className="bg-gray-50 p-6 rounded-xl border border-gray-100 h-fit sticky top-8">
                    <h2 className="text-xl font-medium mb-4">Résumé de la commande</h2>
                    <div className="space-y-3 mb-4">
                        {cart.map(item => (
                            <div key={item.id} className="flex justify-between text-sm">
                                <span className="text-gray-500">{item.name} × {item.quantity}</span>
                                <span className="font-medium">{(item.price * item.quantity).toLocaleString('fr-FR')} FCFA</span>
                            </div>
                        ))}
                    </div>
                    <div className="border-t border-gray-200 pt-4 flex justify-between font-bold text-lg">
                        <span>Total</span>
                        <span>{cartTotal.toLocaleString('fr-FR')} FCFA</span>
                    </div>

                    {/* Indicateur d'étape */}
                    <div className="mt-6 flex gap-2">
                        {[0, 1].map(i => (
                            <div key={i} className={`h-1 flex-1 rounded-full transition-all ${
                                step === 'delivery' && i === 0 ? 'bg-primary' :
                                step === 'payment'  ? 'bg-primary' :
                                'bg-gray-200'
                            }`} />
                        ))}
                    </div>
                    <p className="text-xs text-gray-400 mt-2 text-center">
                        {step === 'delivery' ? 'Étape 1/2 — Livraison' : 'Étape 2/2 — Paiement'}
                    </p>
                </div>
            </div>
        </div>
    );
};
