import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';

export const Vision = () => {
    return (
        <div className="pt-12 pb-20 px-4 max-w-4xl mx-auto">
            <div className="text-center mb-16">
                <h1 className="text-4xl font-serif font-bold text-text mb-4">Notre Vision & Innovation</h1>
                <p className="text-text-muted text-lg max-w-2xl mx-auto">
                    Chez Pauline Boutique, nous croyons en un avenir où la mode est accessible, durable et innovante.
                </p>
            </div>

            {/* Vision */}
            <div className="bg-primary-light/20 rounded-2xl p-8 mb-10">
                <h2 className="text-2xl font-serif font-bold text-text mb-4">🔭 Notre Vision</h2>
                <p className="text-text-muted leading-relaxed mb-4">
                    Devenir la boutique de référence en Afrique de l'Ouest pour la mode féminine élégante et accessible.
                    Nous voulons que chaque femme, peu importe son budget, puisse se sentir belle et confiante.
                </p>
                <p className="text-text-muted leading-relaxed">
                    Notre ambition est de connecter les femmes togolaises et africaines aux tendances mondiales,
                    tout en valorisant l'artisanat et le savoir-faire local.
                </p>
            </div>

            {/* Innovation */}
            <div className="grid md:grid-cols-2 gap-6 mb-10">
                {[
                    { icon: '🛍️', titre: 'Shopping en ligne simplifié', desc: 'Une expérience d\'achat fluide et sécurisée depuis votre téléphone ou ordinateur, avec livraison à domicile.' },
                    { icon: '📱', titre: 'Présence sur les réseaux', desc: 'Suivez-nous sur TikTok et Facebook pour découvrir les nouveautés en avant-première et des offres exclusives.' },
                    { icon: '🚚', titre: 'Livraison rapide', desc: 'Nous travaillons à étendre notre réseau de livraison pour couvrir tout le Togo et bientôt toute l\'Afrique de l\'Ouest.' },
                    { icon: '💳', titre: 'Paiement Mobile Money', desc: 'Payez facilement avec Tmoney, Flooz ou votre carte bancaire. La sécurité avant tout.' },
                ].map((item) => (
                    <div key={item.titre} className="bg-surface border border-gray-100 rounded-xl p-6 shadow-sm">
                        <div className="text-3xl mb-3">{item.icon}</div>
                        <h3 className="font-bold text-text mb-2">{item.titre}</h3>
                        <p className="text-sm text-text-muted">{item.desc}</p>
                    </div>
                ))}
            </div>

            {/* CTA */}
            <div className="text-center bg-primary/5 border border-primary/20 rounded-2xl p-8">
                <h2 className="text-xl font-bold text-text mb-2">Faites partie de l'aventure</h2>
                <p className="text-text-muted mb-4">Rejoignez notre communauté et soyez les premiers à profiter de nos innovations.</p>
                <div className="flex gap-4 justify-center flex-wrap">
                    <Link to="/shop"><Button>Visiter la boutique</Button></Link>
                    <Link to="/register"><Button variant="outline">Créer un compte</Button></Link>
                </div>
            </div>
        </div>
    );
};
