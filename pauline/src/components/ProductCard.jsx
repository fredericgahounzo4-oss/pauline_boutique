import { ShoppingCart, Heart } from 'lucide-react';
import { Button } from './ui/Button';
import { useCart } from '../context/CartContext';
import { Link } from 'react-router-dom';

export const ProductCard = ({ product }) => {
    const { addToCart, addToWishlist, removeFromWishlist, isInWishlist } = useCart();
    const inWishlist = isInWishlist(product.id);

    return (
        <div className="group relative bg-white rounded-lg overflow-hidden border border-transparent hover:border-primary/20 transition-all duration-300 shadow-sm hover:shadow-xl">
            {/* Bouton Wishlist */}
            <button
                onClick={(e) => {
                    e.preventDefault();
                    inWishlist ? removeFromWishlist(product.id) : addToWishlist(product);
                }}
                className={`absolute top-3 right-3 z-10 p-2 rounded-full shadow-md transition-all duration-200 ${
                    inWishlist
                        ? 'bg-red-500 text-white hover:bg-red-600'
                        : 'bg-white text-gray-400 hover:text-red-500 hover:bg-red-50'
                }`}
                title={inWishlist ? 'Retirer des favoris' : 'Ajouter aux favoris'}
            >
                <Heart size={16} fill={inWishlist ? 'currentColor' : 'none'} />
            </button>

            <Link to={`/product/${product.id}`} className="block">
                <div className="aspect-square overflow-hidden bg-gray-100 relative">
                    <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                    />
                </div>
            </Link>
            <div className="p-4 space-y-2">
                <p className="text-xs text-text-muted uppercase tracking-wider">{product.category}</p>
                <h3 className="text-lg font-serif font-bold text-text group-hover:text-primary transition-colors">
                    {product.name}
                </h3>
                <p className="text-primary font-medium">
                    {product.price.toLocaleString('fr-FR')} fcfa
                </p>
                <Button
                    variant="primary"
                    className="w-full flex items-center justify-center gap-2 text-sm py-2 mt-4"
                    onClick={(e) => {
                        e.preventDefault();
                        addToCart(product);
                    }}
                >
                    <ShoppingCart size={16} /> Ajouter au panier
                </Button>
            </div>
        </div>
    );
};
