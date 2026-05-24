import { useEffect, useState } from 'react';
import { apiUrl } from '../../utils/api';

const STATUTS = ['en_attente', 'payee', 'en_cours', 'livree', 'annulee'];
const STATUT_COLORS = {
    en_attente: 'bg-yellow-100 text-yellow-800',
    payee:      'bg-blue-100 text-blue-800',
    en_cours:   'bg-purple-100 text-purple-800',
    livree:     'bg-green-100 text-green-800',
    annulee:    'bg-red-100 text-red-800',
};

export const AdminCommandes = () => {
    const [commandes, setCommandes] = useState([]);
    const [loading, setLoading]     = useState(true);
    const [error, setError]         = useState('');
    const [selected, setSelected]   = useState(null);

    const load = () => {
        fetch(apiUrl('/api/admin/commandes'))
            .then(r => r.json())
            .then(d => { setCommandes(d.commandes || []); setLoading(false); })
            .catch(() => { setError('Erreur de chargement.'); setLoading(false); });
    };

    useEffect(() => { load(); }, []);

    const updateStatut = async (id, statut) => {
        await fetch(apiUrl('/api/admin/commande-statut'), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id, statut })
        });
        load();
    };

    if (loading) return <div className="p-8 text-center text-text-muted">Chargement...</div>;
    if (error)   return <div className="p-8 text-center text-red-500">{error}</div>;

    return (
        <div className="p-6 max-w-6xl mx-auto">
            <h1 className="text-2xl font-serif font-bold text-text mb-6">Commandes ({commandes.length})</h1>

            <div className="bg-surface rounded-xl border border-gray-100 overflow-x-auto">
                <table className="w-full text-sm">
                    <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
                        <tr>
                            <th className="px-4 py-3 text-left">N°</th>
                            <th className="px-4 py-3 text-left">Client</th>
                            <th className="px-4 py-3 text-left">Montant</th>
                            <th className="px-4 py-3 text-left">Paiement</th>
                            <th className="px-4 py-3 text-left">Statut</th>
                            <th className="px-4 py-3 text-left">Date</th>
                            <th className="px-4 py-3 text-left">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {commandes.map(c => (
                            <tr key={c.id} className="hover:bg-gray-50">
                                <td className="px-4 py-3 font-mono text-xs">{c.numero_commande}</td>
                                <td className="px-4 py-3">{c.client_nom || 'Invité'}<br/><span className="text-xs text-gray-400">{c.client_email}</span></td>
                                <td className="px-4 py-3 font-medium">{Number(c.montant_total).toLocaleString('fr-FR')} FCFA</td>
                                <td className="px-4 py-3 text-gray-500">{c.methode_paiement}</td>
                                <td className="px-4 py-3">
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${STATUT_COLORS[c.statut] || 'bg-gray-100'}`}>
                                        {c.statut.replace('_', ' ')}
                                    </span>
                                </td>
                                <td className="px-4 py-3 text-gray-400">{new Date(c.created_at).toLocaleDateString('fr-FR')}</td>
                                <td className="px-4 py-3">
                                    <select value={c.statut} onChange={e => updateStatut(c.id, e.target.value)}
                                        className="text-xs border border-gray-200 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-primary">
                                        {STATUTS.map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
                                    </select>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
