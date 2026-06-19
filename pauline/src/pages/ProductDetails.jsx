import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { ShoppingBag, Star, Heart } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { apiUrl } from '../utils/api';
import clsx from 'clsx';

const StarRating = ({ value, onChange, readonly = false, size = 24 }) => {
    const [hovered, setHovered] = useState(0);
    return (
        <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map(i => (
                <button key={i} type="button"
                    disabled={readonly}
                    onClick={() => !readonly && onChange && onChange(i)}
                    onMouseEnter={() => !readonly && setHovered(i)}
                    onMouseLeave={() => !readonly && setHovered(0)}
                    className={readonly ? 'cursor-default' : 'cursor-pointer'}>
                    <Star size={size}
                        className={`transition-colors ${
                            i <= (hovered || value)
                                ? 'text-yellow-400 fill-yellow-400'
                                : 'text-gray-300 fill-gray-300'
                        }`} />
                </button>
            ))}
        </div>
    );
};

export const ProductDetails = () => {
    const { id } = useParams();
    const { addToCart, addToWishlist, removeFromWishlist, isInWishlist } = useCart();

    const [product, setProduct]           = useState(null);
    const [loading, setLoading]           = useState(true);
    const [selectedImage, setSelectedImage] = useState(null);

    // Avis
    const [avis, setAvis]                 = useState([]);
    const [noteMoyenne, setNoteMoyenne]   = useState(0);
    const [nombreAvis, setNombreAvis]     = useState(0);
    const [userNote, setUserNote]         = useState(0);
    const [commentaire, setCommentaire]   = useState('');
    const [submitting, setSubmitting]     = useState(false);
    const [avisMsg, setAvisMsg]           = useState('');

    const user = JSON.parse(localStorage.getItem('pauline_user') || 'null');

    const loadProduct = () => {
        fetch(apiUrl('/api/produits/list'))
            .then(r => r.json())
            .then(data => {
                if (data.success) {
                    const found = data.produits.find(p => p.id === parseInt(id));
                    setProduct(found || null);
                    if (found) {
                        setSelectedImage(found.slides?.[0] || found.image);
                        setNoteMoyenne(found.rating || 0);
                        setNombreAvis(found.reviews || 0);
                    }
                }
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    };

    const loadAvis = () => {
        fetch(apiUrl(`/api/produits/${id}/avis`))
            .then(r => r.json())
            .then(data => {
                if (data.success) {
                    setAvis(data.avis);
                    setNoteMoyenne(data.note_moyenne);
                    setNombreAvis(data.nombre_avis);
                }
            })
            .catch(console.error);
    };

    useEffect(() => {
        loadProduct();
        loadAvis();
    }, [id]);

    const handleSubmitAvis = async (e) => {
        e.preventDefault();
        if (!user) { setAvisMsg('Connectez-vous pour laisser un avis.'); return; }
        if (!userNote) { setAvisMsg('Veuillez sélectionner une note.'); return; }

        setSubmitting(true);
        setAvisMsg('');

        try {
            const res = await fetch(apiUrl('/api/produits/avis/add'), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    utilisateur_id: user.id,
                    produit_id:     parseInt(id),
                    note:           userNote,
                    commentaire:    commentaire,
                })
            });
            const data = await res.json();
            if (data.success) {
                setAvisMsg('✅ Avis enregistré !');
                setUserNote(0);
                setCommentaire('');
                setNoteMoyenne(data.note_moyenne);
                setNombreAvis(data.nombre_avis);
                loadAvis();
            } else {
                setAvisMsg('❌ ' + (data.error || 'Erreur.'));
            }
        } catch {
            setAvisMsg('❌ Erreur réseau.');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return (
        <div className="pt-20 pb-20 flex items-center justify-center min-h-[60vh]">
            <p className="text-text-muted">Chargement...</p>
        </div>
    );

    if (!product) return (
        <div className="pt-20 pb-20 flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
            <h1 className="text-2xl font-serif font-bold text-text mb-2">Produit introuvable</h1>
            <p className="text-text-muted">Ce produit n'existe pas ou a été supprimé.</p>
        </div>
    );

    const inWishlist = isInWishlist(product.id);

    return (
        <div className="pt-8 pb-20 px-4 max-w-7xl mx-auto">

            {/* Mobile: titre et prix */}
            <div className="md:hidden mb-6 space-y-4">
                <div>
                    <h1 className="text-3xl font-serif font-bold text-text mt-2">{product.name}</h1>
                    <div className="flex items-center gap-3 mt-2">
                        <StarRating value={Math.round(noteMoyenne)} readonly size={16} />
                        <span className="text-text-muted text-sm">{nombreAvis} avis</span>
                    </div>
                </div>
                <div className="border-t border-b border-gray-100 py-4">
                    <span className="text-3xl font-medium text-text">
                        {product.price.toLocaleString('fr-FR')} fcfa
                    </span>
                </div>
            </div>

            <div className="grid md:grid-cols-2 gap-12 lg:gap-16">

                {/* Images */}
                <div className="relative md:sticky md:top-24 h-fit flex flex-col gap-6">
                    <div className="bg-white rounded-lg overflow-hidden border border-gray-100 shadow-sm">
                        <img src={selectedImage || product.image} alt={product.name}
                            className="w-full h-auto object-contain p-8 max-h-[500px]" />
                    </div>
                    {product.slides && product.slides.length > 1 && (
                        <div className="flex flex-wrap justify-center gap-4">
                            {product.slides.map((slide, i) => (
                                <button key={i} onClick={() => setSelectedImage(slide)}
                                    className={clsx(
                                        "w-20 h-20 rounded-md border overflow-hidden bg-white p-1 transition-all",
                                        selectedImage === slide
                                            ? "border-primary ring-1 ring-primary scale-105"
                                            : "border-gray-200 hover:border-primary/50"
                                    )}>
                                    <img src={slide} alt={`Vue ${i + 1}`} className="w-full h-full object-contain" />
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Infos */}
                <div className="flex flex-col space-y-8">
                    <div className="hidden md:block">
                        <h1 className="text-3xl lg:text-4xl font-serif font-bold text-text mt-2">{product.name}</h1>
                        <div className="flex items-center gap-3 mt-2">
                            <StarRating value={Math.round(noteMoyenne)} readonly size={18} />
                            <span className="text-text-muted text-sm">
                                {noteMoyenne > 0 ? noteMoyenne.toFixed(1) : '—'} · {nombreAvis} avis
                            </span>
                        </div>
                    </div>

                    <div className="hidden md:block border-t border-b border-gray-100 py-4">
                        <span className="text-3xl font-medium text-text">
                            {product.price.toLocaleString('fr-FR')} fcfa
                        </span>
                    </div>

                    {product.description && (
                        <div className="border-t border-gray-100 pt-6">
                            <h3 className="font-bold text-lg mb-3">Description</h3>
                            <p className="text-sm text-text-muted leading-relaxed">{product.description}</p>
                        </div>
                    )}

                    <div className="border-t border-gray-100 pt-6">
                        <h3 className="font-bold text-lg mb-4">Détails</h3>
                        <div className="grid grid-cols-[140px_1fr] gap-y-2 text-sm">
                            <span className="font-medium text-text">Catégorie</span>
                            <span className="text-text-muted">{product.category}</span>
                            <span className="font-medium text-text">Note moyenne</span>
                            <span className="text-text-muted">{noteMoyenne > 0 ? noteMoyenne.toFixed(1) + ' / 5' : 'Pas encore noté'}</span>
                            <span className="font-medium text-text">Avis clients</span>
                            <span className="text-text-muted">{nombreAvis} avis</span>
                        </div>
                    </div>

                    <div className="pt-6 border-t border-gray-100">
                        <div className="flex gap-4">
                            <Button onClick={() => addToCart(product)}
                                className="flex-1 py-4 text-lg flex items-center justify-center gap-2">
                                <ShoppingBag /> Ajouter au panier
                            </Button>
                            <Button variant="outline"
                                className={`px-4 ${inWishlist ? 'bg-red-50 border-red-400 text-red-500' : ''}`}
                                onClick={() => inWishlist ? removeFromWishlist(product.id) : addToWishlist(product)}>
                                <Heart size={20} fill={inWishlist ? 'currentColor' : 'none'} />
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Section Avis ──────────────────────────────────────────────── */}
            <div className="mt-16 border-t border-gray-100 pt-12">
                <h2 className="text-2xl font-serif font-bold text-text mb-8">
                    Avis clients ({nombreAvis})
                </h2>

                <div className="grid md:grid-cols-2 gap-12">

                    {/* Formulaire avis */}
                    <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
                        <h3 className="font-bold text-lg mb-4">
                            {user ? 'Laissez votre avis' : 'Connectez-vous pour laisser un avis'}
                        </h3>

                        {user ? (
                            <form onSubmit={handleSubmitAvis} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-text mb-2">Votre note *</label>
                                    <StarRating value={userNote} onChange={setUserNote} size={32} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-text mb-2">Commentaire (optionnel)</label>
                                    <textarea
                                        value={commentaire}
                                        onChange={e => setCommentaire(e.target.value)}
                                        placeholder="Partagez votre expérience avec ce produit..."
                                        rows={4}
                                        className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-primary resize-none"
                                    />
                                </div>
                                {avisMsg && (
                                    <p className={`text-sm ${avisMsg.startsWith('✅') ? 'text-green-600' : 'text-red-500'}`}>
                                        {avisMsg}
                                    </p>
                                )}
                                <Button type="submit" disabled={submitting} className="w-full py-3">
                                    {submitting ? 'Envoi...' : 'Publier mon avis'}
                                </Button>
                            </form>
                        ) : (
                            <div className="text-center py-6">
                                <p className="text-text-muted text-sm mb-4">Vous devez être connecté pour laisser un avis.</p>
                                <a href="/login" className="inline-block bg-primary text-white px-6 py-2 rounded-xl text-sm font-medium hover:bg-primary/90 transition-colors">
                                    Se connecter
                                </a>
                            </div>
                        )}
                    </div>

                    {/* Liste des avis */}
                    <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
                        {avis.length === 0 ? (
                            <div className="text-center py-12 text-text-muted">
                                <Star size={40} className="mx-auto mb-3 text-gray-300" />
                                <p>Aucun avis pour le moment.</p>
                                <p className="text-sm mt-1">Soyez le premier à donner votre avis !</p>
                            </div>
                        ) : (
                            avis.map(a => (
                                <div key={a.id} className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
                                    <div className="flex items-center justify-between mb-2">
                                        <div>
                                            <p className="font-semibold text-text text-sm">{a.auteur}</p>
                                            <p className="text-xs text-text-muted">
                                                {new Date(a.created_at).toLocaleDateString('fr-FR', {
                                                    day: '2-digit', month: 'long', year: 'numeric'
                                                })}
                                            </p>
                                        </div>
                                        <StarRating value={a.note} readonly size={14} />
                                    </div>
                                    {a.commentaire && (
                                        <p className="text-sm text-text-muted mt-2 leading-relaxed">{a.commentaire}</p>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
