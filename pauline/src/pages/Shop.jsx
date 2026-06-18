import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ProductCard } from '../components/ProductCard';
import { SlidersHorizontal, ArrowUpDown, ChevronDown, Check, X } from 'lucide-react';
import clsx from 'clsx';
import { Button } from '../components/ui/Button';
import { apiUrl } from '../utils/api';

export const Shop = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const urlCategory = searchParams.get('category');
    const urlSearch   = searchParams.get('search');

    const [products, setProducts]               = useState([]);
    const [loading, setLoading]                 = useState(true);
    const [selectedCategory, setSelectedCategory] = useState(urlCategory || 'Tous');
    const [sortBy, setSortBy]                   = useState('featured');
    const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

    // ── Chargement depuis l'API Django ────────────────────────────────────────
    useEffect(() => {
        setLoading(true);
        fetch(apiUrl('/api/produits/list'))
            .then(r => r.json())
            .then(data => {
                if (data.success) setProducts(data.produits);
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    // ── Sync URL → état catégorie ─────────────────────────────────────────────
    useEffect(() => {
        if (urlCategory) {
            setSelectedCategory(urlCategory.charAt(0).toUpperCase() + urlCategory.slice(1));
        } else {
            setSelectedCategory('Tous');
        }
    }, [urlCategory]);

    const handleCategoryChange = (category) => {
        setSelectedCategory(category);
        const newParams = new URLSearchParams();
        if (category !== 'Tous') newParams.set('category', category.toLowerCase());
        if (urlSearch) newParams.set('search', urlSearch);
        setSearchParams(newParams);
        setIsMobileFilterOpen(false);
    };

    // ── Catégories uniques depuis l'API ───────────────────────────────────────
    const uniqueCategories = ['Tous', ...new Set(products.map(p => p.category))];

    // ── Filtrage & tri ────────────────────────────────────────────────────────
    const shuffledProducts = useMemo(() => [...products].sort(() => 0.5 - Math.random()), [products]);
    const sourceProducts = (selectedCategory === 'Tous' && sortBy === 'featured') ? shuffledProducts : products;

    const filteredProducts = sourceProducts
        .filter(product => {
            const matchesCategory = selectedCategory === 'Tous' ||
                product.category.toLowerCase() === selectedCategory.toLowerCase();
            const matchesSearch = !urlSearch ||
                product.name.toLowerCase().includes(urlSearch.toLowerCase()) ||
                product.category.toLowerCase().includes(urlSearch.toLowerCase());
            return matchesCategory && matchesSearch;
        })
        .sort((a, b) => {
            if (sortBy === 'price-low')  return a.price - b.price;
            if (sortBy === 'price-high') return b.price - a.price;
            if (sortBy === 'name')       return a.name.localeCompare(b.name);
            return 0;
        });

    return (
        <div className="pt-8 pb-20 px-4 max-w-7xl mx-auto">
            <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 relative">

                {/* Sidebar Filtres Desktop */}
                <aside className="hidden lg:block w-64 flex-shrink-0 space-y-8 sticky top-24 h-fit">
                    <div>
                        <h3 className="font-serif font-bold text-xl mb-4">Catégories</h3>
                        <div className="space-y-2">
                            {uniqueCategories.map(category => (
                                <button key={category} onClick={() => handleCategoryChange(category)}
                                    className={clsx(
                                        "block w-full text-left px-2 py-1.5 rounded-md text-sm transition-colors",
                                        selectedCategory === category
                                            ? "bg-primary text-white font-medium shadow-md"
                                            : "text-text-muted hover:bg-gray-100 hover:text-text"
                                    )}>
                                    {category}
                                </button>
                            ))}
                        </div>
                    </div>
                </aside>

                {/* Contenu principal */}
                <div className="flex-1">
                    <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
                        <div>
                            <h1 className="text-3xl font-serif font-bold text-text">
                                {selectedCategory === 'Tous' ? 'Tous nos produits' : selectedCategory}
                            </h1>
                            <p className="text-text-muted text-sm mt-1">
                                {loading ? 'Chargement...' : `${filteredProducts.length} résultat${filteredProducts.length > 1 ? 's' : ''} trouvé${filteredProducts.length > 1 ? 's' : ''}`}
                            </p>
                        </div>

                        <div className="flex items-center gap-3">
                            <Button variant="outline" className="lg:hidden flex items-center gap-2"
                                onClick={() => setIsMobileFilterOpen(true)}>
                                <SlidersHorizontal size={18} /> Filtres
                            </Button>

                            <div className="relative group">
                                <div className="flex items-center gap-2 border border-gray-200 rounded-md px-3 py-2 bg-white cursor-pointer hover:border-gray-300">
                                    <span className="text-sm text-text-muted">Trier par :</span>
                                    <span className="text-sm font-medium min-w-[100px]">
                                        {sortBy === 'featured'   && 'En vedette'}
                                        {sortBy === 'price-low'  && 'Prix : Croissant'}
                                        {sortBy === 'price-high' && 'Prix : Décroissant'}
                                        {sortBy === 'name'       && 'Nom : A-Z'}
                                    </span>
                                    <ChevronDown size={14} className="text-text-muted" />
                                </div>
                                <div className="absolute right-0 top-full mt-1 w-52 bg-white border border-gray-100 shadow-xl rounded-md overflow-hidden hidden group-hover:block z-20">
                                    {[
                                        { label: 'En vedette',        value: 'featured' },
                                        { label: 'Prix : Croissant',  value: 'price-low' },
                                        { label: 'Prix : Décroissant',value: 'price-high' },
                                        { label: 'Nom : A-Z',         value: 'name' },
                                    ].map(option => (
                                        <button key={option.value} onClick={() => setSortBy(option.value)}
                                            className={clsx(
                                                "w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center justify-between",
                                                sortBy === option.value ? "text-primary font-medium bg-primary/5" : "text-text"
                                            )}>
                                            {option.label}
                                            {sortBy === option.value && <Check size={14} />}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {loading ? (
                        <div className="text-center py-20 text-text-muted">Chargement des produits...</div>
                    ) : filteredProducts.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                            {filteredProducts.map(product => (
                                <ProductCard key={product.id} product={product} />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-20 bg-gray-50 rounded-lg border border-dashed border-gray-200">
                            <p className="text-lg text-text-muted mb-2">Aucun produit trouvé.</p>
                            <p className="text-sm text-text-muted">Essayez de modifier vos filtres.</p>
                            <Button variant="outline" className="mt-4"
                                onClick={() => { setSelectedCategory('Tous'); setSearchParams({}); }}>
                                Réinitialiser les filtres
                            </Button>
                        </div>
                    )}
                </div>
            </div>

            {/* Filtre Mobile */}
            {isMobileFilterOpen && (
                <div className="fixed inset-0 z-50 lg:hidden">
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                        onClick={() => setIsMobileFilterOpen(false)} />
                    <div className="absolute right-0 top-0 bottom-0 w-80 bg-white shadow-2xl p-6 overflow-y-auto">
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-xl font-serif font-bold">Filtres</h2>
                            <button onClick={() => setIsMobileFilterOpen(false)}
                                className="p-2 -mr-2 text-text-muted hover:text-text">
                                <X size={24} />
                            </button>
                        </div>
                        <div>
                            <h3 className="font-bold text-lg mb-3">Catégories</h3>
                            <div className="space-y-2">
                                {uniqueCategories.map(category => (
                                    <button key={category} onClick={() => handleCategoryChange(category)}
                                        className={clsx(
                                            "block w-full text-left px-3 py-2 rounded-md text-sm transition-colors border",
                                            selectedCategory === category
                                                ? "bg-primary text-white border-primary"
                                                : "bg-white text-text border-gray-200"
                                        )}>
                                        {category}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <Button className="w-full py-3 mt-6" onClick={() => setIsMobileFilterOpen(false)}>
                            Voir les {filteredProducts.length} résultats
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
};
