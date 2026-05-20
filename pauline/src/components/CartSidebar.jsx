import { motion, AnimatePresence } from 'framer-motion';
import { X, Minus, Plus, Trash2 } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { Button } from './ui/Button';
import { useNavigate } from 'react-router-dom';

export const CartSidebar = () => {
    const { cart, isCartOpen, setIsCartOpen, removeFromCart, updateQuantity, cartTotal } = useCart();
    const navigate = useNavigate();

    const handleCheckout = () => {
        setIsCartOpen(false);
        navigate('/checkout');
    };

    return (
        <AnimatePresence>
            {isCartOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setIsCartOpen(false)}
                        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
                    />

                    {/* Sidebar */}
                    <motion.div
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className="fixed inset-y-0 right-0 w-full max-w-md bg-white shadow-2xl z-50 flex flex-col"
                    >
                        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                            <h2 className="text-2xl font-serif font-bold text-text">Mon Panier</h2>
                            <button
                                onClick={() => setIsCartOpen(false)}
                                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6 space-y-6">
                            {cart.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
                                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                                        <span className="text-2xl">🛒</span>
                                    </div>
                                    <p className="text-text-muted">Votre panier est vide.</p>
                                    <Button variant="outline" onClick={() => setIsCartOpen(false)}>
                                        Continuer mes achats
                                    </Button>
                                </div>
                            ) : (
                                cart.map(item => (
                                    <div key={item.id} className="flex gap-4">
                                        <div className="w-20 h-20 bg-gray-100 rounded-md overflow-hidden flex-shrink-0">
                                            <img
                                                src={item.image || item.slides?.[0]}
                                                alt={item.name}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="font-medium text-text">{item.name}</h3>
                                            <p className="text-sm text-text-muted">{item.category}</p>
                                            <div className="flex items-center justify-between mt-2">
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                        className="p-1 hover:bg-gray-100 rounded"
                                                    >
                                                        <Minus size={14} />
                                                    </button>
                                                    <span className="text-sm w-4 text-center">{item.quantity}</span>
                                                    <button
                                                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                        className="p-1 hover:bg-gray-100 rounded"
                                                    >
                                                        <Plus size={14} />
                                                    </button>
                                                </div>
                                                <p className="font-medium text-primary">
                                                    {(item.price * item.quantity).toLocaleString('fr-FR')} fcfa
                                                </p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => removeFromCart(item.id)}
                                            className="text-gray-400 hover:text-red-500 transition-colors h-fit"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>

                        {cart.length > 0 && (
                            <div className="p-6 border-t border-gray-100 space-y-4 bg-background-alt/50">
                                <div className="flex justify-between items-center text-lg font-medium">
                                    <span>Sous-total</span>
                                    <span>{cartTotal.toLocaleString('fr-FR')} fcfa</span>
                                </div>
                                <Button className="w-full py-3 text-lg" onClick={handleCheckout}>
                                    Passer la commande
                                </Button>
                            </div>
                        )}
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};
