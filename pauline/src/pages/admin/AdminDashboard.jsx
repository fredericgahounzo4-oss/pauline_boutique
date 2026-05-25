import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiUrl } from '../../utils/api';

export const AdminDashboard = () => {
    const [stats, setStats]     = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError]     = useState('');

    useEffect(() => {
        fetch(apiUrl('/api/admin/stats'))
            .then(r => r.json())
            .then(data => {
                if (data.success) setStats(data);
                else setError('Impossible de charger les statistiques.');
            })
            .catch(() => setError('Erreur réseau. Vérifiez que le serveur est lancé.'))
            .finally(() => setLoading(false));
    }, []);

    const user = JSON.parse(localStorage.getItem('pauline_user') || '{}');

    const statutColor = (s) => ({
        'en_attente': 'bg-yellow-100 text-yellow-700',
        'payee':      'bg-blue-100 text-blue-700',
        'en_cours':   'bg-orange-100 text-orange-700',
        'livree':     'bg-green-100 text-green-700',
        'annulee':    'bg-red-100 text-red-700',
    }[s] || 'bg-gray-100 text-gray-600');

    return (
        <div className="pt-8 pb-20 px-4 max-w-7xl mx-auto">

            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-serif font-bold text-text">Panel Admin</h1>
                    <p className="text-text-muted text-sm mt-1">Bienvenue, {user.nom}</p>
                </div>
                <div className="flex gap-3">
                    <Link to="/admin/produits"
                        className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-dark transition-colors">
                        Gérer les produits
                    </Link>
                    <Link to="/admin/commandes"
                        className="border border-primary text-primary px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary hover:text-white transition-colors">
                        Voir les commandes
                    </Link>
                    <Link to="/"
                        className="border border-gray-200 text-text-muted px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors">
                        Voir la boutique
                    </Link>
                </div>
            </div>

            {loading && <div className="text-center py-20 text-text-muted">Chargement...</div>}

            {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm mb-6">
                    ❌ {error}
                </div>
            )}

            {stats && (
                <>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
                        {[
                            { label: 'Produits actifs',    value: stats.nb_produits,      color: 'bg-primary/10 text-primary' },
                            { label: 'Clients inscrits',   value: stats.nb_clients,        color: 'bg-blue-50 text-blue-700' },
                            { label: 'Commandes',          value: stats.nb_commandes,      color: 'bg-purple-50 text-purple-700' },
                            { label: "Chiffre d'affaires", value: Number(stats.chiffre_affaires).toLocaleString('fr-FR') + ' FCFA', color: 'bg-green-50 text-green-700' },
                        ].map((s, i) => (
                            <div key={i} className={`rounded-xl p-5 ${s.color} border border-current/10`}>
                                <p className="text-2xl font-bold">{s.value}</p>
                                <p className="text-sm mt-1 opacity-80">{s.label}</p>
                            </div>
                        ))}
                    </div>

                    <div className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                            <h2 className="font-medium text-text">Dernières commandes</h2>
                            <Link to="/admin/commandes" className="text-sm text-primary hover:underline">Voir tout →</Link>
                        </div>
                        <div className="divide-y divide-gray-50">
                            {stats.dernieres_commandes.length === 0 && (
                                <p className="text-center text-text-muted py-8 text-sm">Aucune commande pour le moment.</p>
                            )}
                            {stats.dernieres_commandes.map(cmd => (
                                <div key={cmd.id} className="px-6 py-4 flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-text">{cmd.numero_commande}</p>
                                        <p className="text-xs text-text-muted mt-0.5">
                                            {cmd.client_nom || 'Client invité'} — {new Date(cmd.created_at).toLocaleDateString('fr-FR')}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <span className="text-sm font-medium">
                                            {parseFloat(cmd.montant_total).toLocaleString('fr-FR')} FCFA
                                        </span>
                                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${statutColor(cmd.statut)}`}>
                                            {cmd.statut.replace('_', ' ')}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};
