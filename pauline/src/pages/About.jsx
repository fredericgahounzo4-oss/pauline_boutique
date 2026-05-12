import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';

export const About = () => {
    return (
        <div className="pt-12 pb-20 px-4 max-w-4xl mx-auto">
            {/* Hero */}
            <div className="text-center mb-16">
                <h1 className="text-4xl font-serif font-bold text-text mb-4">À propos de nous</h1>
                <p className="text-text-muted text-lg max-w-2xl mx-auto">
                    Découvrez l'histoire derrière Pauline Boutique, une boutique née de la passion pour la mode et l'élégance.
                </p>
            </div>

            {/* Notre histoire */}
            <div className="bg-primary-light/20 rounded-2xl p-8 mb-10">
                <h2 className="text-2xl font-serif font-bold text-text mb-4">Notre Histoire</h2>
                <p className="text-text-muted leading-relaxed mb-4">
                    Pauline Boutique est née à Lomé, au Togo, avec une vision simple : rendre la mode élégante et accessible à toutes les femmes.
                    Fondée avec passion, notre boutique propose une sélection soignée de vêtements, accessoires et articles de mode de qualité.
                </p>
                <p className="text-text-muted leading-relaxed">
                    Chaque article est choisi avec soin pour vous offrir le meilleur de la mode, alliant style moderne et confort au quotidien.
                </p>
            </div>

            {/* Nos valeurs */}
            <div className="grid md:grid-cols-3 gap-6 mb-10">
                {[
                    { icon: '✨', title: 'Qualité', desc: 'Nous sélectionnons uniquement des articles de qualité supérieure pour notre clientèle.' },
                    { icon: '💛', title: 'Passion', desc: 'La mode est notre passion. Chaque choix est fait avec amour et dévouement.' },
                    { icon: '🌍', title: 'Proximité', desc: 'Basés à Lomé, nous servons nos clients avec chaleur et professionnalisme.' },
                ].map((v) => (
                    <div key={v.title} className="bg-surface border border-gray-100 rounded-xl p-6 text-center shadow-sm">
                        <div className="text-4xl mb-3">{v.icon}</div>
                        <h3 className="font-bold text-text mb-2">{v.title}</h3>
                        <p className="text-sm text-text-muted">{v.desc}</p>
                    </div>
                ))}
            </div>

            {/* CTA */}
            <div className="text-center">
                <Link to="/shop">
                    <Button className="px-8 py-3">Découvrir notre boutique</Button>
                </Link>
            </div>
        </div>
    );
};
