import { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { Button } from '../components/ui/Button';
import { useNavigate, Link } from 'react-router-dom';

// ─── Config CinetPay (.env) ───────────────────────────────────────────────────
const CINETPAY_CONFIG = {
    apikey:     import.meta.env.VITE_CINETPAY_API_KEY    || 'VOTRE_API_KEY',
    site_id:    import.meta.env.VITE_CINETPAY_SITE_ID    || 'VOTRE_SITE_ID',
    notify_url: import.meta.env.VITE_CINETPAY_NOTIFY_URL || '',
    mode:       import.meta.env.VITE_CINETPAY_MODE       || 'TEST',
};

// ─── Opérateurs Mobile Money disponibles au Togo ─────────────────────────────
const MOBILE_OPERATORS = [
    { value: 'TG-TMONEY',  label: 'Togocel (T-Money)' },
    { value: 'TG-FLOOZ',   label: 'Moov (Flooz)' },
    { value: 'CI-ORANGE',  label: 'Orange Money' },
    { value: 'SN-WAVE',    label: 'Wave' },
    { value: 'CI-MTN',     label: 'MTN Mobile Money' },
];

function loadCinetPaySDK() {
    return new Promise((resolve, reject) => {
        if (document.getElementById('cinetpay-sdk')) { resolve(); return; }
        const script = document.createElement('script');
        script.id = 'cinetpay-sdk';
        script.src = 'https://cdn.cinetpay.com/seamless/main.js';
        script.async = true;
        script.onload = () => resolve();
        script.onerror = () => reject(new Error('SDK introuvable'));
        document.body.appendChild(script);
    });
}

// ── Petits composants UI ──────────────────────────────────────────────────────
const Label = ({ children }) => (
    <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-1">{children}</p>
);

const Field = ({ label, error, children }) => (
    <div className="space-y-1">
        {label && <Label>{label}</Label>}
        {children}
        {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
);

const inputCls = (err) =>
    `w-full border rounded-lg px-4 py-3 text-sm outline-none transition-colors focus:ring-2 focus:ring-primary/30 ${
        err ? 'border-red-400 bg-red-50' : 'border-gray-200 focus:border-primary'
    }`;

const AmountBadge = ({ label, amount, icon }) => (
    <div className="flex items-center justify-between bg-primary/10 border border-primary/30 rounded-lg px-4 py-3 mb-6">
        <span className="flex items-center gap-2 text-sm font-medium text-primary">
            <span>{icon}</span> {label}
        </span>
        <span className="font-bold text-primary">{amount.toLocaleString('fr-FR')} FCFA</span>
    </div>
);

const BackButton = ({ onClick }) => (
    <button type="button" onClick={onClick}
        className="flex items-center gap-1 text-sm text-primary mb-6 hover:underline">
        ← Retour
    </button>
);

const PayButton = ({ amount, disabled, loading }) => (
    <button type="submit" disabled={disabled}
        className="w-full mt-6 bg-primary hover:bg-primary/90 disabled:opacity-60 text-white font-semibold rounded-xl py-4 text-base transition-colors flex items-center justify-center gap-2">
        {loading ? 'Traitement...' : <>🔒 Payer {amount.toLocaleString('fr-FR')} FCFA →</>}
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

    // ── Données formulaires ───────────────────────────────────────────────────
    const [delivery, setDelivery] = useState({
        firstName: '', lastName: '', email: '', phone: '', address: '', city: '', zip: ''
    });
    const [deliveryErrors, setDeliveryErrors] = useState({});

    const [mobile, setMobile] = useState({ operator: 'TG-TMONEY', phone: '', pin: '' });
    const [mobileErrors, setMobileErrors] = useState({});

    const [card, setCard] = useState({ number: '', holder: '', expiry: '', cvv: '' });
    const [cardErrors, setCardErrors] = useState({});

    // ── SDK CinetPay ──────────────────────────────────────────────────────────
    useEffect(() => {
        loadCinetPaySDK()
            .then(() => setSdkReady(true))
            .catch(() => setSdkError('Service de paiement indisponible. Rechargez la page.'));
    }, []);

    // ── Validation livraison ──────────────────────────────────────────────────
    const validateDelivery = () => {
        const e = {};
        if (!delivery.firstName.trim()) e.firstName = 'Requis';
        if (!delivery.lastName.trim())  e.lastName  = 'Requis';
        if (!delivery.email || !/\S+@\S+\.\S+/.test(delivery.email)) e.email = 'E-mail invalide';
        if (!delivery.phone.trim())   e.phone   = 'Requis';
        if (!delivery.address.trim()) e.address = 'Requis';
        if (!delivery.city.trim())    e.city    = 'Requis';
        if (!delivery.zip.trim())     e.zip     = 'Requis';
        return e;
    };

    const handleDeliverySubmit = (e) => {
        e.preventDefault();
        const errs = validateDelivery();
        if (Object.keys(errs).length) { setDeliveryErrors(errs); return; }
        setStep('select');
    };

    // ── Validation Mobile Money ───────────────────────────────────────────────
    const validateMobile = () => {
        const e = {};
        if (!mobile.phone.trim()) e.phone = 'Numéro requis';
        if (!mobile.pin.trim() || mobile.pin.length < 4) e.pin = 'Code secret requis (4 chiffres min.)';
        return e;
    };

    // ── Validation Carte ──────────────────────────────────────────────────────
    const validateCard = () => {
        const e = {};
        const num = card.number.replace(/\s/g, '');
        if (!num || num.length < 16) e.number = 'Numéro de carte invalide';
        if (!card.holder.trim())     e.holder = 'Nom du titulaire requis';
        if (!card.expiry || !/^\d{2}\/\d{2}$/.test(card.expiry)) e.expiry = 'Format MM/AA';
        if (!card.cvv || card.cvv.length < 3) e.cvv = 'CVV invalide';
        return e;
    };

    // ── Appel CinetPay ────────────────────────────────────────────────────────
    const triggerCinetPay = (channel) => {
        return new Promise((resolve, reject) => {
            if (!sdkReady || typeof window.CinetPay === 'undefined') {
                reject(new Error('SDK non prêt'));
                return;
            }

            const transactionId = 'TXN_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7).toUpperCase();

            window.CinetPay.setConfig({
                apikey:     CINETPAY_CONFIG.apikey,
                site_id:    CINETPAY_CONFIG.site_id,
                notify_url: CINETPAY_CONFIG.notify_url,
                mode:       CINETPAY_CONFIG.mode,
            });

            window.CinetPay.waitResponse(function (data) {
                if (data.status === 'ACCEPTED')       resolve({ transactionId, data });
                else if (data.status === 'PENDING')   resolve({ transactionId, data, pending: true });
                else                                  reject(new Error('Paiement refusé'));
            });

            window.CinetPay.onError(function (data) {
                reject(new Error(data.message || 'Erreur de paiement'));
            });

            window.CinetPay.getCheckout({
                transaction_id:        transactionId,
                amount:                cartTotal,
                currency:              'XOF',
                channels:              channel,
                description:           'Commande Pauline Boutique',
                customer_name:         delivery.firstName,
                customer_surname:      delivery.lastName,
                customer_email:        delivery.email,
                customer_phone_number: delivery.phone,
                customer_address:      delivery.address,
                customer_city:         delivery.city,
                customer_country:      'TG',
                customer_zip_code:     delivery.zip,
            });
        });
    };

    // ─── Enregistrer la commande dans MySQL via PHP ───────────────────────────
    const saveOrderToDB = async (transactionId, method) => {
        // Récupérer l'utilisateur connecté (null si non connecté)
        const user = JSON.parse(localStorage.getItem('pauline_user') || 'null');

        const payload = {
            utilisateur_id:   user?.id || null,
            items:            cart,
            montant_total:    cartTotal,
            methode_paiement: method,
            operateur_mobile: mobile.operator,
            transaction_id:   transactionId,
            adresse_livraison: {
                prenom:      delivery.firstName,
                nom:         delivery.lastName,
                email:       delivery.email,
                telephone:   delivery.phone,
                adresse:     delivery.address,
                ville:       delivery.city,
                code_postal: delivery.zip
            }
        };

        const res = await fetch('/api/commandes/create.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const data = await res.json();

        if (!res.ok || !data.success) {
            throw new Error(data.error || "Erreur lors de l'enregistrement de la commande.");
        }

        return data; // { commande_id, numero_commande }
    };

    // ─── Finaliser la commande ────────────────────────────────────────────────
    const finalizeOrder = async (transactionId, method) => {
        try {
            // 1. Enregistrer dans MySQL
            const dbResult = await saveOrderToDB(transactionId, method);

            // 2. Ajouter dans le state React (pour affichage immédiat dans /orders)
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

            // 3. Vider le panier et afficher succès
            clearCart();
            setStep('success');

        } catch (err) {
            setGlobalError(err.message || 'Erreur réseau. Vérifiez que XAMPP est lancé.');
        }
    };

    // ── Soumission Mobile Money ───────────────────────────────────────────────
    const handleMobileSubmit = async (e) => {
        e.preventDefault();
        const errs = validateMobile();
        if (Object.keys(errs).length) { setMobileErrors(errs); return; }

        setIsProcessing(true);
        setGlobalError('');
        try {
            const { transactionId, pending } = await triggerCinetPay('MOBILE_MONEY');
            if (pending) {
                alert('Paiement en cours de validation. Vous recevrez une confirmation par SMS.');
            }
            await finalizeOrder(transactionId, 'Mobile Money');
        } catch (err) {
            setGlobalError(err.message || 'Une erreur est survenue. Veuillez réessayer.');
        } finally {
            setIsProcessing(false);
        }
    };

    // ── Soumission Carte bancaire ─────────────────────────────────────────────
    const handleCardSubmit = async (e) => {
        e.preventDefault();
        const errs = validateCard();
        if (Object.keys(errs).length) { setCardErrors(errs); return; }

        setIsProcessing(true);
        setGlobalError('');
        try {
            const { transactionId } = await triggerCinetPay('CREDIT_CARD');
            await finalizeOrder(transactionId, 'Carte bancaire');
        } catch (err) {
            setGlobalError(err.message || 'Une erreur est survenue. Veuillez réessayer.');
        } finally {
            setIsProcessing(false);
        }
    };

    // ── Formatage ─────────────────────────────────────────────────────────────
    const formatCardNumber = (val) =>
        val.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim();

    const formatExpiry = (val) => {
        const d = val.replace(/\D/g, '').slice(0, 4);
        return d.length >= 3 ? d.slice(0, 2) + '/' + d.slice(2) : d;
    };

    // ─────────────────────────────────────────────────────────────────────────
    // RENDU
    // ─────────────────────────────────────────────────────────────────────────

    if (cart.length === 0 && step !== 'success') {
        return (
            <div className="p-20 text-center text-lg">
                <p className="mb-4">Votre panier est vide.</p>
                <Link to="/shop"><Button>Continuer mes achats</Button></Link>
            </div>
        );
    }

    // ── SUCCÈS ────────────────────────────────────────────────────────────────
    if (step === 'success') {
        return (
            <div className="pt-20 pb-20 px-4 max-w-7xl mx-auto flex flex-col items-center text-center space-y-6">
                <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center text-green-600 text-4xl">✓</div>
                <h1 className="text-4xl font-serif font-bold text-text">Commande Confirmée !</h1>
                <p className="text-text-muted max-w-md">
                    Merci pour votre achat. Votre commande a bien été enregistrée et sauvegardée.
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
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">⚠️ {sdkError}</div>
            )}

            <div className="grid md:grid-cols-2 gap-12 items-start">

                {/* ── COLONNE GAUCHE : étapes de paiement ───────────────── */}
                <div>

                    {/* ════ ÉTAPE 1 : Infos livraison ════ */}
                    {step === 'delivery' && (
                        <form onSubmit={handleDeliverySubmit} className="space-y-5">
                            <h2 className="text-xl font-medium mb-2">Informations de livraison</h2>

                            <div className="grid grid-cols-2 gap-4">
                                <Field error={deliveryErrors.firstName}>
                                    <input name="firstName" value={delivery.firstName}
                                        onChange={e => { setDelivery({...delivery, firstName: e.target.value}); setDeliveryErrors({...deliveryErrors, firstName: ''}); }}
                                        placeholder="Prénom" className={inputCls(deliveryErrors.firstName)} />
                                </Field>
                                <Field error={deliveryErrors.lastName}>
                                    <input name="lastName" value={delivery.lastName}
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
                                <Field error={deliveryErrors.zip}>
                                    <input value={delivery.zip}
                                        onChange={e => { setDelivery({...delivery, zip: e.target.value}); setDeliveryErrors({...deliveryErrors, zip: ''}); }}
                                        placeholder="Code Postal" className={inputCls(deliveryErrors.zip)} />
                                </Field>
                            </div>

                            <button type="submit"
                                className="w-full mt-2 bg-primary hover:bg-primary/90 text-white font-semibold rounded-xl py-4 text-base transition-colors">
                                Continuer vers le paiement →
                            </button>
                        </form>
                    )}

                    {/* ════ ÉTAPE 2 : Sélection du moyen de paiement ════ */}
                    {step === 'select' && (
                        <div className="space-y-3">
                            <BackButton onClick={() => setStep('delivery')} />
                            <h2 className="text-xl font-medium mb-4">Sélectionnez votre moyen de paiement :</h2>

                            <button type="button" onClick={() => setStep('mobile')}
                                className="w-full flex items-center justify-between border border-gray-200 rounded-xl px-5 py-4 hover:border-primary hover:bg-primary/5 transition-all group">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center text-xl">📱</div>
                                    <div className="text-left">
                                        <p className="font-semibold text-gray-800 text-sm">Mobile Money</p>
                                        <p className="text-xs text-gray-400">Togocel, Moov, MTN, Orange</p>
                                    </div>
                                </div>
                                <span className="text-gray-300 group-hover:text-primary text-lg">›</span>
                            </button>

                            <button type="button" onClick={() => setStep('card')}
                                className="w-full flex items-center justify-between border border-gray-200 rounded-xl px-5 py-4 hover:border-primary hover:bg-primary/5 transition-all group">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center text-xl">💳</div>
                                    <div className="text-left">
                                        <p className="font-semibold text-gray-800 text-sm">Carte bancaire</p>
                                        <p className="text-xs text-gray-400">Visa, Mastercard, CB</p>
                                    </div>
                                </div>
                                <span className="text-gray-300 group-hover:text-primary text-lg">›</span>
                            </button>
                        </div>
                    )}

                    {/* ════ ÉTAPE 3a : Mobile Money ════ */}
                    {step === 'mobile' && (
                        <form onSubmit={handleMobileSubmit} className="space-y-5">
                            <BackButton onClick={() => { setStep('select'); setGlobalError(''); }} />
                            <AmountBadge label="Mobile Money" amount={cartTotal} icon="📱" />

                            <Field label="Opérateur Mobile Money">
                                <select value={mobile.operator}
                                    onChange={e => setMobile({...mobile, operator: e.target.value})}
                                    className={inputCls(false)}>
                                    {MOBILE_OPERATORS.map(op => (
                                        <option key={op.value} value={op.value}>{op.label}</option>
                                    ))}
                                </select>
                            </Field>

                            <Field label="Numéro de téléphone" error={mobileErrors.phone}>
                                <input value={mobile.phone}
                                    onChange={e => { setMobile({...mobile, phone: e.target.value}); setMobileErrors({...mobileErrors, phone: ''}); }}
                                    placeholder="+228 90 00 00 00"
                                    className={inputCls(mobileErrors.phone)} />
                            </Field>

                            <Field label="Code secret Mobile Money" error={mobileErrors.pin}>
                                <input type="password" maxLength={6} value={mobile.pin}
                                    onChange={e => { setMobile({...mobile, pin: e.target.value.replace(/\D/,'')}); setMobileErrors({...mobileErrors, pin: ''}); }}
                                    placeholder="••••"
                                    className={inputCls(mobileErrors.pin)} />
                                <p className="text-xs text-gray-400 flex items-center gap-1 mt-1">🔒 Votre code est chiffré et sécurisé.</p>
                            </Field>

                            <div className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-xs text-gray-600">
                                📲 <strong>Comment ça marche :</strong> Vous recevrez une notification USSD sur votre téléphone. Confirmez le paiement en entrant votre code PIN sur votre téléphone.
                            </div>

                            {globalError && (
                                <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
                                    ❌ {globalError}
                                </p>
                            )}

                            {CINETPAY_CONFIG.mode === 'TEST' && (
                                <p className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded px-3 py-2 text-center">
                                    Mode TEST — aucun vrai paiement effectué
                                </p>
                            )}

                            <PayButton amount={cartTotal} disabled={isProcessing || !sdkReady} loading={isProcessing} />
                        </form>
                    )}

                    {/* ════ ÉTAPE 3b : Carte bancaire ════ */}
                    {step === 'card' && (
                        <form onSubmit={handleCardSubmit} className="space-y-5">
                            <BackButton onClick={() => { setStep('select'); setGlobalError(''); }} />
                            <AmountBadge label="Carte bancaire" amount={cartTotal} icon="💳" />

                            <Field label="Numéro de carte" error={cardErrors.number}>
                                <div className="relative">
                                    <input value={card.number}
                                        onChange={e => { setCard({...card, number: formatCardNumber(e.target.value)}); setCardErrors({...cardErrors, number: ''}); }}
                                        placeholder="0000 0000 0000 0000"
                                        maxLength={19}
                                        className={inputCls(cardErrors.number) + ' pr-12'} />
                                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xl">💳</span>
                                </div>
                            </Field>

                            <Field label="Nom du titulaire" error={cardErrors.holder}>
                                <input value={card.holder}
                                    onChange={e => { setCard({...card, holder: e.target.value.toUpperCase()}); setCardErrors({...cardErrors, holder: ''}); }}
                                    placeholder="NOM PRÉNOM (comme sur la carte)"
                                    className={inputCls(cardErrors.holder)} />
                            </Field>

                            <div className="grid grid-cols-2 gap-4">
                                <Field label="Date d'expiration" error={cardErrors.expiry}>
                                    <input value={card.expiry}
                                        onChange={e => { setCard({...card, expiry: formatExpiry(e.target.value)}); setCardErrors({...cardErrors, expiry: ''}); }}
                                        placeholder="MM/AA" maxLength={5}
                                        className={inputCls(cardErrors.expiry)} />
                                </Field>
                                <Field label="CVV / CVC" error={cardErrors.cvv}>
                                    <input type="password" value={card.cvv} maxLength={4}
                                        onChange={e => { setCard({...card, cvv: e.target.value.replace(/\D/,'')}); setCardErrors({...cardErrors, cvv: ''}); }}
                                        placeholder="•••"
                                        className={inputCls(cardErrors.cvv)} />
                                </Field>
                            </div>

                            <div className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-xs text-gray-600">
                                🔒 <strong>Paiement 3D Secure.</strong> Vous serez redirigé vers votre banque pour confirmer le paiement par SMS ou application.
                            </div>

                            <div className="flex gap-2 items-center">
                                {['VISA', 'MC', 'CB'].map(b => (
                                    <span key={b} className="text-xs border border-gray-300 rounded px-2 py-1 text-gray-500 font-medium">{b}</span>
                                ))}
                            </div>

                            {globalError && (
                                <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
                                    ❌ {globalError}
                                </p>
                            )}

                            {CINETPAY_CONFIG.mode === 'TEST' && (
                                <p className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded px-3 py-2 text-center">
                                    Mode TEST — aucun vrai paiement effectué
                                </p>
                            )}

                            <PayButton amount={cartTotal} disabled={isProcessing || !sdkReady} loading={isProcessing} />
                        </form>
                    )}
                </div>

                {/* ── COLONNE DROITE : récapitulatif ─── */}
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
                        {['delivery', 'select', 'mobile'].map((s, i) => (
                            <div key={s} className={`h-1 flex-1 rounded-full transition-all ${
                                step === 'delivery' && i === 0 ? 'bg-primary' :
                                step === 'select'   && i <= 1 ? 'bg-primary' :
                                (step === 'mobile' || step === 'card') && i <= 2 ? 'bg-primary' :
                                'bg-gray-200'
                            }`} />
                        ))}
                    </div>
                    <p className="text-xs text-gray-400 mt-2 text-center">
                        {step === 'delivery' ? 'Étape 1/3 — Livraison' :
                         step === 'select'   ? 'Étape 2/3 — Moyen de paiement' :
                                              'Étape 3/3 — Paiement'}
                    </p>
                </div>
            </div>
        </div>
    );
};
