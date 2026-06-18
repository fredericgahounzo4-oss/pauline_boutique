import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Hero } from '../components/Hero';
import { ProductCard } from '../components/ProductCard';
import { Button } from '../components/ui/Button';
import { apiUrl } from '../utils/api';

export const Home = () => {
    const [featuredProducts, setFeaturedProducts] = useState([]);

    useEffect(() => {
        fetch(apiUrl('/api/produits/list'))
            .then(r => r.json())
            .then(data => {
                if (data.success) {
                    const produits = data.produits;
                    // 1 produit par catégorie
                    const featured = [
                        produits.find(p => p.category === 'Chaussures'),
                        produits.find(p => p.category === 'Vêtements'),
                        produits.find(p => p.category === 'Accessoires'),
                    ].filter(Boolean);
                    setFeaturedProducts(featured);
                }
            })
            .catch(console.error);
    }, []);

    return (
        <>
            <Hero />
            <section className="py-20 px-4 max-w-7xl mx-auto">
                <div className="text-center mb-16">
                    <h2 className="text-4xl font-serif font-bold text-text mt-3">Collection très bien notée</h2>
                    <div className="w-24 h-1 bg-primary mx-auto mt-6 rounded-full"></div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                    {featuredProducts.map((product) => (
                        <ProductCard key={product.id} product={product} />
                    ))}
                </div>

                <div className="text-center mt-12">
                    <Link to="/shop">
                        <Button variant="outline" className="min-w-[200px] border-primary text-primary hover:bg-primary hover:text-white transition-colors">
                            Achetez plus
                        </Button>
                    </Link>
                </div>
            </section>
        </>
    );
};
