import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { ShoppingBag, Star, Heart } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { apiUrl } from '../utils/api';
import clsx from 'clsx';

export const ProductDetails = () => {
    const { id } = useParams();
    const { addToCart, addToWishlist, removeFromWishlist, isInWishlist } = useCart();

    const [product, setProduct]           = useState(null);
    const [loading, setLoading]           = useState(true);
    const [selectedImage, setSelectedImage] = useState(null);

    useEffect(() => {
        setLoading(true);
        fetch(apiUrl('/api/produits/list'))
            .then(r => r.json())
            .then(data => {
                if (data.success) {
                    const found = data.produits.find(p => p.id === parseInt(id));
                    setProduct(found || null);
                    if (found) {
                        const firstImage = found.slides?.[0] || found.image;
                        setSelectedImage(firstImage);
                    }
                }
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [id]);

    if (loading) {
        return (
            <div className="pt-20 pb-20 flex items-center justify-center min-h-[60vh]">
                <p className="text-text-muted">Chargement...</p>
            </div>
        );
    }

    if (!product) {
        return (
            <div className="pt-20 pb-20 flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
                <h1 className="text-2xl font-serif font-bold text-text mb-2">Produit introuvable</h1>
                <p className="text-text-muted">Ce produit n'existe pas ou a été supprimé.</p>
            </div>
        );
    }

    const displayImage = selectedImage || product.image;
    const inWishlist = isInWishlist(product.id);

    return (
        <div className="pt-8 pb-20 px-4 max-w-7xl mx-auto">

            {/* Mobile: titre et prix en haut */}
            <div className="md:hidden mb-6 space-y-4">
                <div>
                    <h1 className="text-3xl font-serif font-bold text-text mt-2">{product.name}</h1>
                    <div className="flex items-center space-x-4 mt-2">
                        <div className="flex text-yellow-500">
                            {[...Array(5)].map((_, i) => <Star key={i} size={16} fill="currentColor" />)}
                        </div>
                        <span className="text-text-muted text-sm border-l border-gray-300 pl-4">
                            {product.reviews || 0} Avis
                        </span>
                    </div>
                </div>
                <div className="border-t border-b border-gray-100 py-4">
                    <span className="text-3xl font-medium text-text">
                        {product.price.toLocaleString('fr-FR')} fcfa
                    </span>
                </div>
            </div>

            <div className="grid md:grid-cols-2 gap-12 lg:gap-16">

                {/* Image principale + miniatures */}
                <div className="relative md:sticky md:top-24 h-fit flex flex-col gap-6">
                    <div className="bg-white rounded-lg overflow-hidden border border-gray-100 shadow-sm w-full">
                        <img
                            src={displayImage}
                            alt={product.name}
                            className="w-full h-auto object-contain p-8 max-h-[500px]"
                        />
                    </div>

                    {product.slides && product.slides.length > 1 && (
                        <div className="flex flex-wrap justify-center gap-4">
                            {product.slides.map((slide, index) => (
                                <button key={index} onClick={() => setSelectedImage(slide)}
                                    className={clsx(
                                        "w-20 h-20 rounded-md border overflow-hidden flex-shrink-0 bg-white p-1 transition-all",
                                        selectedImage === slide
                                            ? "border-primary ring-1 ring-primary scale-105"
                                            : "border-gray-200 hover:border-primary/50"
                                    )}>
                                    <img src={slide} alt={`Miniature ${index + 1}`} className="w-full h-full object-contain" />
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Infos produit */}
                <div className="flex flex-col space-y-8">

                    {/* Titre + note Desktop */}
                    <div className="hidden md:block">
                        <h1 className="text-3xl lg:text-4xl font-serif font-bold text-text mt-2">{product.name}</h1>
                        <div className="flex items-center space-x-4 mt-2">
                            <div className="flex text-yellow-500">
                                {[...Array(5)].map((_, i) => <Star key={i} size={16} fill="currentColor" />)}
                            </div>
                            <span className="text-text-muted text-sm border-l border-gray-300 pl-4">
                                {product.reviews || 0} Avis
                            </span>
                        </div>
                    </div>

                    {/* Prix Desktop */}
                    <div className="hidden md:block border-t border-b border-gray-100 py-4">
                        <span className="text-3xl font-medium text-text">
                            {product.price.toLocaleString('fr-FR')} fcfa
                        </span>
                    </div>

                    {/* Description */}
                    {product.description && (
                        <div className="border-t border-gray-100 pt-6">
                            <h3 className="font-bold text-lg mb-3">Description</h3>
                            <p className="text-sm text-text-muted leading-relaxed">{product.description}</p>
                        </div>
                    )}

                    {/* Détails */}
                    <div className="border-t border-gray-100 pt-6">
                        <h3 className="font-bold text-lg mb-4">Détails du produit</h3>
                        <div className="grid grid-cols-[140px_1fr] gap-y-2 text-sm">
                            <span className="font-medium text-text">Catégorie</span>
                            <span className="text-text-muted">{product.category}</span>
                            <span className="font-medium text-text">Note</span>
                            <span className="text-text-muted">{product.rating || '0'} / 5</span>
                            <span className="font-medium text-text">Avis</span>
                            <span className="text-text-muted">{product.reviews || 0} clients</span>
                        </div>
                    </div>

                    {/* Boutons */}
                    <div className="pt-6 border-t border-gray-100 space-y-4">
                        <div className="flex gap-4">
                            <Button onClick={() => addToCart(product)}
                                className="flex-1 py-4 text-lg flex items-center justify-center gap-2">
                                <ShoppingBag /> Ajouter au panier
                            </Button>
                            <Button variant="outline"
                                className={`px-4 ${inWishlist ? 'bg-red-50 border-red-400 text-red-500' : ''}`}
                                onClick={() => inWishlist ? removeFromWishlist(product.id) : addToWishlist(product)}
                                title={inWishlist ? 'Retirer des favoris' : 'Ajouter aux favoris'}>
                                <Heart size={20} fill={inWishlist ? 'currentColor' : 'none'} />
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
