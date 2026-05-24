export const News = () => {
    const articles = [
        {
            date: 'Avril 2025',
            titre: 'Nouvelle collection Printemps-Été 2025 disponible !',
            desc: 'Découvrez notre toute nouvelle collection avec des pièces tendance pour la saison chaude. Des couleurs vives, des matières légères et des coupes modernes vous attendent.',
            tag: 'Nouvelle collection',
        },
        {
            date: 'Mars 2025',
            titre: 'Pauline Boutique lance la livraison express à Lomé',
            desc: 'Bonne nouvelle ! Nous proposons désormais la livraison express en 24h dans toute la ville de Lomé. Commandez avant 14h et recevez votre commande le lendemain.',
            tag: 'Annonce',
        },
        {
            date: 'Février 2025',
            titre: 'Promotions spéciales Saint-Valentin — jusqu\'à -30%',
            desc: 'Pour la Saint-Valentin, profitez de réductions exceptionnelles sur une sélection de nos plus belles pièces. Offrez ou faites-vous plaisir !',
            tag: 'Promotion',
        },
        {
            date: 'Janvier 2025',
            titre: 'Ouverture officielle de Pauline Boutique en ligne',
            desc: 'Nous sommes fiers d\'annoncer le lancement officiel de notre boutique en ligne. Désormais, shoppez depuis chez vous et recevez vos commandes à domicile.',
            tag: 'Événement',
        },
    ];

    const tagColors = {
        'Nouvelle collection': 'bg-green-100 text-green-700',
        'Annonce': 'bg-blue-100 text-blue-700',
        'Promotion': 'bg-red-100 text-red-700',
        'Événement': 'bg-primary/10 text-primary',
    };

    return (
        <div className="pt-12 pb-20 px-4 max-w-4xl mx-auto">
            <div className="text-center mb-16">
                <h1 className="text-4xl font-serif font-bold text-text mb-4">Actualités & Annonces</h1>
                <p className="text-text-muted text-lg max-w-2xl mx-auto">
                    Restez informé(e) des dernières nouvelles, promotions et événements de Pauline Boutique.
                </p>
            </div>

            <div className="space-y-8">
                {articles.map((a) => (
                    <div key={a.titre} className="bg-surface border border-gray-100 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex flex-wrap justify-between items-center gap-2 mb-3">
                            <span className={`text-xs font-medium px-3 py-1 rounded-full ${tagColors[a.tag]}`}>{a.tag}</span>
                            <span className="text-xs text-text-muted">{a.date}</span>
                        </div>
                        <h3 className="text-lg font-bold text-text mb-2">{a.titre}</h3>
                        <p className="text-text-muted text-sm leading-relaxed">{a.desc}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};
