import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiUrl } from '../../utils/api';

export const AdminDashboard = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetch(apiUrl('/api/admin/stats'))
            .then(r => r.json())
            .then(d => { setStats(d); setLoading(false); })
            .catch(() => { setError('Erreur de chargement.'); setLoading(false); });
    }, []);

    if (loading) return <div className="p-8 text-center text-text-muted">Chargement...</div>;
    if (error)   return <div className="p-8 text-center text-red-500">{error}</div>;

    const cards = [
        { label: 'Produits actifs',    value: stats.nb_produits,                       color: 'bg-blue-50 text-blue-700',   icon: '📦' },
        { label: 'Clients',            value: stats.nb_clients,                        color: 'bg-purple-50 text-purple-700', icon: '👥' },
        { label: 'Commandes',          value: stats.nb_commandes,                      color: 'bg-amber-50 text-amber-700',  icon: '🛒' },
        { label: "Chiffre d'affaires", value: `${Number(stats.chiffre_affaires).toLocaleString('fr-FR')} FCFA`, color: 'bg-green-50 text-green-700', icon: '💰' },
    ];

    const STATUT_COLORS = {
        en_attente: 'bg-yellow-100 text-yellow-800',
        payee:      'bg-blue-100 text-blue-800',
        en_cours:   'bg-purple-100 text-purple-800',
        livree:     'bg-green-100 text-green-800',
        annulee:    'bg-red-100 text-red-800',
    };

    return (
        <div className="p-6 max-w-6xl mx-auto space-y-8">
            <h1 className="text-2xl font-serif font-bold text-text">Tableau de bord</h1>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {cards.map(c => (
                    <div key={c.label} className={`rounded-xl p-5 ${c.color} border border-current/10`}>
                        <div className="text-2xl mb-2">{c.icon}</div>
                        <div className="text-2xl font-bold">{c.value}</div>
                        <div className="text-sm mt-1 opacity-80">{c.label}</div>
                    </div>
                ))}
            </div>

            <div>
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-text">Dernières commandes</h2>
                    <Link to="/admin/commandes" className="text-sm text-primary hover:underline">Voir tout →</Link>
                </div>
                <div className="bg-surface rounded-xl border border-gray-100 overflow-hidden">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
                            <tr>
                                <th className="px-4 py-3 text-left">N°</th>
                                <th className="px-4 py-3 text-left">Client</th>
                                <th className="px-4 py-3 text-left">Montant</th>
                                <th className="px-4 py-3 text-left">Statut</th>
                                <th className="px-4 py-3 text-left">Date</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {stats.dernieres_commandes.map(c => (
                                <tr key={c.id} className="hover:bg-gray-50">
                                    <td className="px-4 py-3 font-mono text-xs">{c.numero_commande}</td>
                                    <td className="px-4 py-3">{c.client_nom || 'Invité'}</td>
                                    <td className="px-4 py-3 font-medium">{Number(c.montant_total).toLocaleString('fr-FR')} FCFA</td>
                                    <td className="px-4 py-3">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${STATUT_COLORS[c.statut] || 'bg-gray-100 text-gray-700'}`}>
                                            {c.statut.replace('_', ' ')}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-gray-400">{new Date(c.created_at).toLocaleDateString('fr-FR')}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};
