import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import API from '../services/api';

import { Hero } from '../components/Hero';
import { ProductCard } from '../components/ProductCard';
import { Button } from '../components/ui/Button';

export const Home = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        API.get('/api/produits/')
            .then((response) => {
                setProducts(response.data);
                setLoading(false);
            })
            .catch((error) => {
                console.error("Erreur API produits :", error);
                setError("Impossible de charger les produits");
                setLoading(false);
            });
    }, []);

    // sécurité si API vide
    const featuredProducts = [
        products.find(p => p.category === 'Chaussures'),
        products.find(p => p.category === 'Vêtements'),
        products.find(p => p.category === 'Accessoires'),
    ].filter(Boolean);

    return (
        <>
            <Hero />

            <section className="py-20 px-4 max-w-7xl mx-auto">

                <div className="text-center mb-16">
                    <h2 className="text-4xl font-serif font-bold text-text mt-3">
                        Collection très bien notée
                    </h2>
                    <div className="w-24 h-1 bg-primary mx-auto mt-6 rounded-full"></div>
                </div>

                {/* LOADING */}
                {loading && (
                    <p className="text-center text-gray-500">
                        Chargement des produits...
                    </p>
                )}

                {/* ERROR */}
                {error && (
                    <p className="text-center text-red-500">
                        {error}
                    </p>
                )}

                {/* PRODUCTS */}
                {!loading && !error && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                        {featuredProducts.length > 0 ? (
                            featuredProducts.map((product) => (
                                <ProductCard key={product.id} product={product} />
                            ))
                        ) : (
                            <p className="text-center col-span-3 text-gray-500">
                                Aucun produit disponible
                            </p>
                        )}
                    </div>
                )}

                <div className="text-center mt-12">
                    <Link to="/shop">
                        <Button
                            variant="outline"
                            className="min-w-[200px] border-primary text-primary hover:bg-primary hover:text-white transition-colors"
                        >
                            Achetez plus
                        </Button>
                    </Link>
                </div>
            </section>
        </>
    );
};