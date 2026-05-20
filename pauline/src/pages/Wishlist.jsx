import { useCart } from '../context/CartContext';
import { Heart, ShoppingBag, Trash2 } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Link } from 'react-router-dom';

export const Wishlist = () => {
    const { wishlist, removeFromWishlist, addToCart } = useCart();

    if (wishlist.length === 0) {
        return (
            <div className="pt-20 pb-20 flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-6">
                    <Heart size={40} className="text-text-muted" />
                </div>
                <h1 className="text-3xl font-serif font-bold text-text mb-2">Votre liste de favoris est vide</h1>
                <p className="text-text-muted mb-8 max-w-md">
                    Enregistrez les articles que vous aimez pour les retrouver facilement plus tard.
                </p>
                <Link to="/shop">
                    <Button>Explorer nos produits</Button>
                </Link>
            </div>
        );
    }

    return (
        <div className="pt-8 pb-20 px-4 max-w-7xl mx-auto">
            <h1 className="text-3xl font-serif font-bold text-text mb-8">Ma Liste d'Envies ({wishlist.length})</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {wishlist.map((product) => (
                    <div key={product.id} className="bg-white border border-gray-100 rounded-lg overflow-hidden flex flex-col hover:shadow-lg transition-shadow duration-300">
                        <Link to={`/product/${product.id}`} className="block relative aspect-square bg-gray-50 p-4">
                            <img
                                src={product.image}
                                alt={product.name}
                                className="w-full h-full object-contain mix-blend-multiply"
                            />
                        </Link>

                        <div className="p-4 flex-1 flex flex-col">
                            <Link to={`/product/${product.id}`}>
                                <h3 className="text-lg font-serif font-bold text-text mb-1 hover:text-primary transition-colors line-clamp-1">{product.name}</h3>
                            </Link>
                            <p className="text-sm text-text-muted mb-3">{product.category}</p>
                            
                            {/* Correction du prix : passage de ₹ (IN) à € (FR) */}
                            <p className="text-lg font-medium text-primary mb-4">
                                {product.price.toLocaleString('fr-FR')} fcfa
                            </p>

                            <div className="mt-auto flex gap-3">
                                <Button
                                    className="flex-1 flex items-center justify-center gap-2"
                                    onClick={() => addToCart(product)}
                                >
                                    <ShoppingBag size={18} /> Ajouter au panier
                                </Button>
                                <button
                                    onClick={() => removeFromWishlist(product.id)}
                                    className="p-2 border border-gray-200 rounded-md hover:bg-red-50 hover:text-red-500 hover:border-red-200 transition-colors"
                                    title="Retirer des favoris"
                                >
                                    <Trash2 size={20} />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};