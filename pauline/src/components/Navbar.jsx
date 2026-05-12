import { useState } from 'react';
import { ShoppingBag, Menu, X, Search, User, Heart } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { Button } from './ui/Button';

export const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const { cartCount, setIsCartOpen, wishlist } = useCart();
    const navigate = useNavigate();

    const navLinks = [
        { name: 'Home', path: '/' },
        { name: 'Shop', path: '/shop' },
        { name: 'Chaussures', path: '/shop?category=chaussures' },
        { name: 'Vêtements', path: '/shop?category=vêtements' },
        { name: 'Accessoires', path: '/shop?category=accessoires' },
    ];

    const handleSearch = (e) => {
        e.preventDefault();
        const query = e.target.search.value.trim();
        if (query) {
            navigate(`/shop?search=${encodeURIComponent(query)}`);
            setIsOpen(false);
            setIsSearchOpen(false);
            e.target.reset();
        }
    };

    return (
        <header className="fixed w-full z-50">
            {/* Main Navbar */}
            <nav className="bg-surface/95 backdrop-blur-md border-b border-gray-100">
                <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        {/* Left: Logo + Nav */}
                        <div className="flex items-center gap-12">
                            <Link to="/" className="text-2xl font-serif font-bold text-primary tracking-tight flex items-center gap-2">
                                <img src="/logo.png" alt="FashionHub" className="h-8 w-auto" />
                                FashionHub
                            </Link>
                            <div className="hidden lg:flex items-center gap-6">
                                {navLinks.map((link) => (
                                    <Link
                                        key={link.name}
                                        to={link.path}
                                        className="text-sm font-medium text-text hover:text-primary transition-colors hover:bg-black/5 px-3 py-2 rounded-md"
                                    >
                                        {link.name}
                                    </Link>
                                ))}
                            </div>
                        </div>

                        {/* Right Icons - Desktop */}
                        <div className="hidden md:flex items-center gap-4">
                            {/* Search desktop (xl+) */}
                            <div className="relative hidden xl:block">
                                <form onSubmit={handleSearch}>
                                    <input
                                        name="search"
                                        type="text"
                                        placeholder="Rechercher..."
                                        className="bg-transparent border border-transparent hover:border-text-muted focus:border-text-muted transition-colors rounded-full py-1.5 px-4 pl-10 w-48 text-sm outline-none placeholder:text-text-muted text-text"
                                    />
                                    <button type="submit" className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-primary">
                                        <Search size={18} />
                                    </button>
                                </form>
                            </div>

                            {/* Search icon - md to xl */}
                            <button
                                className="xl:hidden text-text hover:text-primary transition-colors p-2"
                                onClick={() => setIsSearchOpen(!isSearchOpen)}
                            >
                                <Search size={20} />
                            </button>

                            {/* Cart */}
                            <button
                                onClick={() => setIsCartOpen(true)}
                                className="relative text-text hover:text-primary transition-colors p-2"
                            >
                                <ShoppingBag size={20} />
                                {cartCount > 0 && (
                                    <span className="absolute top-0 right-0 bg-primary text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                                        {cartCount}
                                    </span>
                                )}
                            </button>

                            {/* Wishlist */}
                            <Link to="/wishlist" className="relative text-text hover:text-primary transition-colors p-2">
                                <Heart size={20} />
                                {wishlist.length > 0 && (
                                    <span className="absolute top-0 right-0 bg-red-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                                        {wishlist.length}
                                    </span>
                                )}
                            </Link>

                            {/* User dropdown */}
                            <div className="group relative">
                                <button className="text-text hover:text-primary transition-colors p-2">
                                    <User size={20} />
                                </button>
                                <div className="absolute right-0 top-full mt-2 w-48 bg-white shadow-xl rounded-lg p-4 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 border border-gray-100 transform origin-top-right z-50">
                                    <p className="font-serif font-bold text-lg mb-2">Mon Compte</p>
                                    <Link to="/login">
                                        <Button className="w-full text-xs py-2 mb-2">Connexion / Inscription</Button>
                                    </Link>
                                    <Link to="/orders" className="block text-sm text-text-muted hover:text-primary py-1">Mes Commandes</Link>
                                    <Link to="/wishlist" className="block text-sm text-text-muted hover:text-primary py-1">Ma Wishlist</Link>
                                </div>
                            </div>
                        </div>

                        {/* Mobile right icons */}
                        <div className="md:hidden flex items-center gap-1">
                            <button onClick={() => setIsSearchOpen(!isSearchOpen)} className="text-text p-2">
                                <Search size={22} />
                            </button>
                            <button
                                onClick={() => setIsCartOpen(true)}
                                className="relative text-text p-2"
                            >
                                <ShoppingBag size={22} />
                                {cartCount > 0 && (
                                    <span className="absolute top-0 right-0 bg-primary text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                                        {cartCount}
                                    </span>
                                )}
                            </button>
                            <button onClick={() => setIsOpen(!isOpen)} className="text-text p-2">
                                {isOpen ? <X size={24} /> : <Menu size={24} />}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Search bar slide-down */}
                {isSearchOpen && (
                    <div className="xl:hidden border-t border-gray-100 px-4 py-3 bg-white shadow-sm">
                        <form onSubmit={handleSearch} className="relative">
                            <input
                                name="search"
                                type="text"
                                placeholder="Rechercher des produits..."
                                autoFocus
                                className="w-full bg-gray-50 border border-gray-200 focus:border-primary/50 transition-all rounded-lg py-2.5 px-4 pl-10 text-sm outline-none text-text"
                            />
                            <button type="submit" className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-primary">
                                <Search size={18} />
                            </button>
                            <button
                                type="button"
                                onClick={() => setIsSearchOpen(false)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text"
                            >
                                <X size={16} />
                            </button>
                        </form>
                    </div>
                )}
            </nav>

            {/* Mobile Menu */}
            {isOpen && (
                <div className="lg:hidden bg-surface border-b border-gray-100 shadow-xl max-h-[80vh] overflow-y-auto">
                    <div className="px-4 pt-4 pb-6 space-y-4">
                        {/* Nav Links */}
                        <div className="space-y-1">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.name}
                                    to={link.path}
                                    className="block text-text font-medium hover:text-primary py-3 px-2 border-b border-gray-50 last:border-0"
                                    onClick={() => setIsOpen(false)}
                                >
                                    {link.name}
                                </Link>
                            ))}
                        </div>

                        {/* Actions */}
                        <div className="grid grid-cols-2 gap-3 pt-2">
                            <button
                                onClick={() => { setIsCartOpen(true); setIsOpen(false); }}
                                className="flex items-center justify-center gap-2 py-2.5 px-4 bg-gray-50 rounded-lg text-sm font-medium text-text hover:bg-gray-100"
                            >
                                <ShoppingBag size={18} />
                                <span>Panier ({cartCount})</span>
                            </button>
                            <Link
                                to="/wishlist"
                                onClick={() => setIsOpen(false)}
                                className="flex items-center justify-center gap-2 py-2.5 px-4 bg-gray-50 rounded-lg text-sm font-medium text-text hover:bg-gray-100"
                            >
                                <Heart size={18} />
                                <span>Favoris ({wishlist.length})</span>
                            </Link>
                        </div>

                        {/* Account */}
                        <div className="pt-2 border-t border-gray-100">
                            <div className="flex items-center justify-between mb-3">
                                <span className="text-xs font-bold text-text-muted uppercase tracking-wider">Mon Compte</span>
                            </div>
                            <Link to="/orders" onClick={() => setIsOpen(false)} className="block py-2 text-sm text-text hover:text-primary">Mes Commandes</Link>
                            <Link to="/login" onClick={() => setIsOpen(false)} className="block mt-3">
                                <Button className="w-full justify-center">Connexion / Inscription</Button>
                            </Link>
                        </div>
                    </div>
                </div>
            )}
        </header>
    );
};
