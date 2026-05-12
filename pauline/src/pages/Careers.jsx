import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';

export const Careers = () => {
    const postes = [
        { titre: 'Conseillère de vente', type: 'Temps plein', lieu: 'Lomé, Togo', desc: 'Accueillir et conseiller les clients, gérer les ventes en boutique et en ligne.' },
        { titre: 'Gestionnaire des réseaux sociaux', type: 'Freelance', lieu: 'À distance', desc: 'Créer et publier du contenu sur Facebook, TikTok et Instagram pour promouvoir la boutique.' },
        { titre: 'Responsable livraison', type: 'Temps partiel', lieu: 'Lomé, Togo', desc: 'Assurer la livraison des commandes aux clients dans les délais.' },
    ];

    return (
        <div className="pt-12 pb-20 px-4 max-w-4xl mx-auto">
            <div className="text-center mb-16">
                <h1 className="text-4xl font-serif font-bold text-text mb-4">Rejoignez notre équipe</h1>
                <p className="text-text-muted text-lg max-w-2xl mx-auto">
                    Vous êtes passionné(e) par la mode ? Rejoignez l'aventure Pauline Boutique et grandissez avec nous.
                </p>
            </div>

            {/* Postes */}
            <div className="space-y-6 mb-12">
                {postes.map((p) => (
                    <div key={p.titre} className="bg-surface border border-gray-100 rounded-xl p-6 shadow-sm hover:border-primary transition-colors">
                        <div className="flex flex-wrap justify-between items-start gap-2 mb-3">
                            <h3 className="text-lg font-bold text-text">{p.titre}</h3>
                            <div className="flex gap-2">
                                <span className="text-xs bg-primary/10 text-primary px-3 py-1 rounded-full">{p.type}</span>
                                <span className="text-xs bg-gray-100 text-text-muted px-3 py-1 rounded-full">📍 {p.lieu}</span>
                            </div>
                        </div>
                        <p className="text-text-muted text-sm mb-4">{p.desc}</p>
                        <a href="mailto:paulineehli7@gmail.com?subject=Candidature - {p.titre}">
                            <Button variant="outline" className="text-sm py-2">Postuler par e-mail</Button>
                        </a>
                    </div>
                ))}
            </div>

            {/* Contact */}
            <div className="bg-primary-light/20 rounded-2xl p-8 text-center">
                <h2 className="text-xl font-bold text-text mb-2">Vous ne trouvez pas votre poste ?</h2>
                <p className="text-text-muted mb-4">Envoyez-nous votre candidature spontanée, nous sommes toujours à la recherche de talents !</p>
                <a href="mailto:paulineehli7@gmail.com?subject=Candidature spontanée">
                    <Button>Envoyer ma candidature</Button>
                </a>
            </div>
        </div>
    );
};
